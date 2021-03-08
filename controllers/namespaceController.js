const {getNamespace} = require('cls-hooked');

const namespaceName = 'com.dataclear.tenant';

exports.bindCurrentNamespace = (globalNs) => {
  return (req, res, next) => {

    globalNs.bindEmitter(req);
    globalNs.bindEmitter(res);
    globalNs.run(() => {
      return next();
    });
  };
};

exports.setCurrentTenantId = (tenantId) => {
  let tenantNs = getNamespace(namespaceName);
  let setNs =  tenantNs.set('tenantId', tenantId);
  return setNs;
};

exports.getCurrentTenantId = () => {
  let tenantNs = getNamespace(namespaceName);
  let getNs = tenantNs.get('tenantId');
  return getNs;
};