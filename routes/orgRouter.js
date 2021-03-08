var express = require('express');
var router = express.Router();

var orgController = require('../controllers/orgController');

router.get('/', async (req, res, next) => {

  try {
    
    let foundOrgs = await orgController.getAllOrgs();

    return res.render('org_list', {
      title: 'All Organisations', 
      orgs: foundOrgs
    });

  } catch (error) {
    return next(error);
  }

});

router.get('/new', async (req, res, next) => {

  try {

    return res.render('org_form', {title: 'New Organisation'});

  } catch (err) {
    return next(err);
  }

});

router.post('/new', async (req, res, next) => {

  try {

    let newOrg = await orgController.createOrg(req.body.name, 'active');
  
    return res.redirect(newOrg.url);

  } catch (err) {
    return next(err);
  }

});

router.get('/:orgid', async (req, res, next) => {
    
  try {

    let foundOrg = await orgController.getOrgById(req.params.orgid);
     
    return res.render('org_view', {title: 'View Organisation', org: foundOrg});

  } catch (err) {
    return next(err);
  }
});

router.get('/:orgid/edit', async (req, res, next) => {
    
  try {

    let foundOrg = await orgController.getOrgById(req.params.orgid);
      
    return res.render('org_form', {title: 'Edit Organisation', org: foundOrg});

  } catch (err) {
    return next(err);
  }

});

router.post('/:orgid/edit', async (req, res, next) => {

  if (req.params.orgid && req.params.id==req.body.orgid){
    
    try {
      let updatedOrg = await orgController.updateOrg(req.params.orgid, req.body.name, req.body.status);
        
      return res.redirect(updatedOrg.url);

    } catch (err) {
      return next(err);
    }

  } else {

    return next(new Error('Id not supplied'));
  }

});

module.exports = router;