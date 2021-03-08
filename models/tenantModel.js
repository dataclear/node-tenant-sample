const mongoose = require('mongoose');
const multiTenant = require('./tenancy/multiTenant');

mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const tenantSchema = new Schema({
  tenantDomain: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'new',
    required: true,
    enum: ['new', 'active', 'inactive', 'deleted']
  },
  companyName: {
    type: String,
    required: true
  },
  serviceName: String,
  fromDomains: [String]
});

tenantSchema.virtual('url').get(function(){
  return '/tenants/' + this._id.toString();
});

tenantSchema.set('toJSON', {
  virtuals: true
});

tenantSchema.set('toObject', {
  virtuals: true
});

module.exports = multiTenant.tenantlessModel('tenant', tenantSchema);