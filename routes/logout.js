var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
  try {
    req.logout();
    res.redirect('/');    
  } catch (err) {
    return next(err);
  }
});

module.exports = router;