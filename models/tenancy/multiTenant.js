// Multi tenancy with Mongo - from http://nmajor.com/posts/multi-tenancy-with-expressmongoose

const mongoose = require('mongoose');
const getTenant = require('../../controllers/namespaceController').getCurrentTenantId;

exports.tenantModel = (name, schema, options) => {
  return (props = {}) => {
    
    // Add tenantId to model
    schema.add({ tenantId: String });
    // Add to index too
    schema.index({tenantId: 1});

    // Create new model from schema with tenant information
    const Model = mongoose.model(name, schema, options);

    const { skipTenant } = props;
    if (skipTenant) return Model;

    Model.schema.set('discriminatorKey', 'tenantId');

    const tenantId = getTenant();
    const discriminatorName = `${Model.modelName}-${tenantId}`;
    const existingDiscriminator = (Model.discriminators || {})[discriminatorName];
    return existingDiscriminator || Model.discriminator(discriminatorName, new mongoose.Schema({}));
  };
};

exports.tenantlessModel = (name, schema, options) => {
  return () => mongoose.model(name, schema, options);
};