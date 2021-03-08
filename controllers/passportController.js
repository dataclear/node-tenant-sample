let UserModel = require('../models/userModel')();
let TenantModel = require('../models/tenantModel')();

exports.passportLogin = async (email, password, done) => {

  try {
    
    let user = await UserModel.findOne({email: email});

    // return same message for incorrect username or password to avoid exposing username
    if (!user) { return done(null, false, 'Username or password incorrect'); }
    if (!user.comparePassword(password)) { 
      return done(null, false, {message: 'Username or password incorrect', userId: user._id}); 
    }
    if (user.status=='inactive'){
      return done(null, false, {message: 'Your login has been disabled, please contact a member of staff', userId: user._id});
    }

    await user.populate('domainAccess.tenant').execPopulate();

    return done(null, user);

  } catch (error) {
    return done(error);
  }

};

exports.serializeUser = (user, done) => {
  done(null, user.toObject());
};

exports.deserializeUser = async (user, done) => {
  
  try {
  
    let foundUser = await UserModel.findById(user._id).populate('domainAccess.tenant');
  
    done(null, foundUser);

  } catch (error) {
    done(error);
  }
};