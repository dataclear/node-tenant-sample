const UserModel = require('../models/userModel');


exports.checkLogin = async (email, provider, done) => {

  try {

    let foundUser = await UserModel().findOne({provider: provider, email: email})
      .populate('domainAccess.tenant')
      .exec();

    if (!foundUser) return done(new Error('Authentication was successful but user was not registered'), null);

    done(null, foundUser);
    
  } catch (error) {
    return done(error, null);
  }

};

exports.createUser = async (provider, email, password) => {

  let newUser = new UserModel()({
    provider: provider,
    email: email,
    password: password
  });

  return await newUser.save();

};