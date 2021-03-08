# node-tenant-sample
Sample of tenant application using MongoDB Descriminator keys to separate documents

Combines the following
- Subdomains
- Multi tenancy with Mongo - from http://nmajor.com/posts/multi-tenancy-with-expressmongoose
- Simple crud of tenant documents (organisations)

Standard models can be declared as below
``` javascript
const mongoose = require('mongoose');
const multiTenant = require('./tenancy/multiTenant');
// ...
const tenantSchema = new Schema({
 // fields
});

module.exports = multiTenant.tenantlessModel('tenant', tenantSchema);
```

Models that need to be split by tenant are defined using the tenantModel helper
``` javascript
const mongoose = require('mongoose');
const multiTenant = require('./tenancy/multiTenant');

mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const orgSchema = new Schema({
 // fields
});

module.exports = multiTenant.tenantModel('org', orgSchema);
```

When using the models it's vital to declare them using their function:

``` javascript
// instead of
let foundOrg = await orgModel.findById(id);

// You would use
let foundOrg = await orgModel().findById(id);
```
