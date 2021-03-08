const mongoose = require('mongoose');
const multiTenant = require('./tenancy/multiTenant');
const bcrypt = require('bcryptjs');

mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const userSchema = new Schema({
  provider: {
    type: String,
    required: true,
    enum: ['local','microsoft','google']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: false
  },
  globalAdmin: {
    type: Boolean,
    required: true,
    default: false
  },
  domainAccess: [{
    tenant: {
      type: Schema.ObjectId,
      ref: 'tenant',
      required: true
    },
    admin: {
      type: Boolean,
      required: true,
      default: false
    }

  }]

});

userSchema.index({
  email: 1
});

userSchema.pre('validate', function(next){
  // ensure password is provided only if provider is local
  if (this.provider !== 'local' || this.password){
    return next();
  } else {
    return next(new Error('password is required for local logins'));
  }
});

userSchema.pre('save', function(next){
  if (!this.isModified('password')) {
    return next();
  }
  else {
    bcrypt.hash(this.password, 11, (err, hash) => {
      if (err) {return next(err); }
      this.password = hash;
      next();
    });
  }
});

userSchema.methods.comparePassword = function(password){
  return bcrypt.compareSync(password, this.password);
};

userSchema.virtual('url').get(function(){
  return '/admin/users/' + this._id;
});

userSchema.set('toJSON', {
  virtuals: true
});

userSchema.set('toObject', {
  virtuals: true
});

module.exports = multiTenant.tenantlessModel('user', userSchema);