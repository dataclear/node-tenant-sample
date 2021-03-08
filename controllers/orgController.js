const orgModel = require('../models/orgModel')();

exports.getOrgById = (id, done) => {
  if (id) {
    orgModel.findById(id, (err, foundOrg) => {
      if (err){return done(err, null);}

      return done(null, foundOrg);
    });
  } else {
    return done(new Error('ID not supplied'), null);
  }
};

exports.getAllOrgs = async () => {
  
  let foundOrgs = await orgModel.find();
  return foundOrgs;

};

exports.createOrg = async (name, type) => {

  let newOrg = orgModel({
    name: name,
    type: type
  });

  let savedOrg = await newOrg.save();

  return savedOrg;
  
};

exports.updateOrg = async (id, name, status) => {
  
  let foundOrg = await orgModel.findById(id);

  foundOrg.name = name;
  foundOrg.status = status;

  let savedOrg = await foundOrg.save();

  return savedOrg;

};

