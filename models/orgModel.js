const mongoose = require('mongoose');
const multiTenant = require('./tenancy/multiTenant');

mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const orgSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'active',
    required: true,
    enum: ['active', 'inactive', 'deleted']
  }
});

orgSchema.virtual('url').get(function(){
  return '/orgs/' + this._id.toString();
});

orgSchema.set('toJSON', {
  virtuals: true
});

orgSchema.set('toObject', {
  virtuals: true
});

module.exports = multiTenant.tenantModel('org', orgSchema);