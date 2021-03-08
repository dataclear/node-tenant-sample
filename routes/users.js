var express = require('express');

var router = express.Router();
/* GET users listing. */

router.get('/', async (req, res, next) => {

  try {
    res.send('respond with a resource');
  } catch (error) {
    return next(error);
  }

});

module.exports = router;

