var express = require('express');
var router = express.Router();

var tenantController = require('../controllers/tenantController');

router.get('/', async (req, res, next) => {

  try {
    
    let foundTenants = await tenantController.getTenants();

    return res.render('tenant_list', {
      tenants: foundTenants,
      title: 'All Tenants'
    });

  } catch (error) {
    return next(error);
  }
});

router;

router.get('/new', async (req, res, next) => {
  try {
    return res.render('tenant_form', {title: 'New Tenant'});
  } catch (err) {
    return next(err);
  }
});

router.post('/new', async (req, res, next) => {

  try {

    let newTenantObject = {
      tenantDomain: req.body.tenantDomain,
      status: 'new',
      companyName: req.body.companyName,
      serviceName: req.body.serviceName,
      fromDomains: req.body.fromDomains
    };

    let newTenant = await tenantController.createTenant(newTenantObject);

    return res.redirect(newTenant.url);

  } catch (error) {
    return next(error);
  }

});

router.get('/:tenantid', async (req, res, next) => {
    
  try {
    
    let foundTenant = await tenantController.getTenantById(req.params.tenantid);

    if (!foundTenant) return next(new Error('tenant not found'));

    return res.render('tenant_view', {title: 'View Tenant', tenant: foundTenant});

  } catch (err) {
    return next(err);
  }
});

router.get('/:tenantid/edit', async (req, res, next) => {
    
  try {
    
    let foundTenant = await tenantController.getTenantById(req.params.tenantid);

    if (!foundTenant) return next(new Error('tenant not found'));

    return res.render('tenant_form', {title: 'Edit Tenant', tenant: foundTenant});

  } catch (err) {
    return next(err);
  }
    
});

router.post('/:tenantid/edit', async (req, res, next) => {

  try {
    
    let foundTenant = await tenantController.getTenantById(req.params.tenantid);
    if (!foundTenant) return next(new Error('tenant not found'));

    let tenantUpdateObject = {
      tenantDomain: req.body.tenantDomain,
      status: req.body.status,
      companyName: req.body.companyName,
      serviceName: req.body.serviceName,
      fromDomains: req.body.fromDomains
    };

    let updatedTenant = tenantController.updateTenant(tenantUpdateObject);

    return res.redirect(updatedTenant.url);

  } catch (err) {
    return next(err);
  }
});

module.exports = router;