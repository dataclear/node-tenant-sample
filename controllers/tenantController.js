const nameSpace = require('./namespaceController');
const flash = require('connect-flash');

// tenant model
const tenantModel = require('../models/tenantModel');

exports.setTenant = async (req, res, next) => {

  const domain = process.env.domain;
  const tenant = (req.session || {}).tenant;
  const tenantDomain = (tenant || {}).domain;

  if (tenant && tenant.id != 'base'){
    nameSpace.setCurrentTenantId(tenant.id);
  }

  // Retrieve host (eg: example.com or sub.example.com)
  const host = req.hostname;

  // if user is requesting base domain or oauth login callback, ignore tenancy
  if (host == domain && /^\/login\/(microsoft)\/callback/.test(req.path) == false){
    nameSpace.setCurrentTenantId('base');
    req.session.tenant = {
      id: 'base',
      domain: domain,
      serviceName: process.env.baseServiceName
    };

    return next();
  }


  // Check if callback
  if (/^\/login\/(microsoft)\/callback/.test(req.path)) {
    return next();
  }

  // Check session is active
  if (!req.session){
    // Session error
    flash({type: 'error', message: 'Session error'});
    res.redirect(domain);
  }

  // Do we need to set tenancy?
  if (!(tenant || {}).id || tenantDomain != host){
      
    // tenancy not set, retrieve from database (we'll check if user can access tenant later)
      
    let foundTenant = await tenantModel().findOne({tenantDomain: host}).exec();

    if (!foundTenant){
      return next(new Error('Invalid host ' + host));
    }

    if (foundTenant.status != 'active'){
      return next(new Error('Account for host ' + host + ' is disabled.'));
    }

    nameSpace.setCurrentTenantId(foundTenant.id);
    req.session.tenant = {
      id: foundTenant.id,
      domain: host,
      serviceName: foundTenant.serviceName
    };

    return next();

  }  else {
    if (req.session.tenant.domain == host){
      // current domain
      return next();
    } else {
      //re-route to the login page to check access
      res.redirect('/login');
    }
  }

};

exports.ensureTenantAccess = (redirect) => {
  return async (req, res, next) => {

    try {
      
      let user = req.user;
      let tenant = (req.session || {}).tenant;

      if (!user || !tenant){
        return res.redirect(redirect);
      }

      if (user.globalAdmin){
        return next();
      }

      if (tenant.id == 'base'){
        return next();
      }

      if (!user.domainAccess || !Array.isArray(user.domainAccess)){
        return res.redirect(redirect);
      }

      let userTenantDomainAccess = user.domainAccess.find(x => (x.tenant || {}).id == tenant.id);

      if (!userTenantDomainAccess){
        return res.redirect(redirect);
      }

      return next();

    } catch (error) {
      req.flash('danger', error.message);
      return res.redirect(redirect);
    }

  };
};

exports.getTenants = async () => {

  let foundTenants = await tenantModel().find({status: 'active'});

  return foundTenants;

};

exports.getTenantById = async (tenantId) => {

  let foundTenant = await tenantModel().findById(tenantId);

  return foundTenant;

};

exports.createTenant = async (newTenantObject) => {

  let newTenant = new tenantModel()(newTenantObject);

  let savedTenant = await newTenant.save();

  return savedTenant;

};

exports.updateTenant = async (tenantId, updateTenantObject) => {

  let foundTenant = await tenantModel().findById(tenantId);

  foundTenant.tenantDomain = updateTenantObject.tenantDomain;
  foundTenant.status = updateTenantObject.status;
  foundTenant.companyName = updateTenantObject.companyName;
  foundTenant.serviceName = updateTenantObject.serviceName;
  foundTenant.fromDomains = updateTenantObject.fromDomains;

  let updatedTenant = await foundTenant.save();

  return updatedTenant;

};

exports.restrictToBase = async (req, res, next) => {

  let tenant = (req.session || {}).tenant;

  if (tenant && tenant.id == 'base'){
    return next();
  } else {
    let baseUrl = req.protocol + '://' +process.env.domain + (process.env.port == '80' ? '' : ':' + process.env.port) + req.originalUrl;
    return res.redirect(baseUrl);
  }

};
