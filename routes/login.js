var express = require('express');
var router = express.Router();
var passport = require('passport');
let userController = require('../controllers/userController');


router.get('/', (req,res,next) => {

  try {

    res.render('login',{
      title: 'Login', 
      err: req.query.err
    });
    
  } catch (error) {
    return next(error);
  }

});

router.post('/', async (req, res, next) => {

  try {
    
    passport.authenticate('local', {successReturnToOrRedirect: '/', failureRedirect: '/login', failureFlash: true}, function(err, user, challenge) {
      if (err) { return next(err); }
      if (!user) { 
        req.flash('danger', (challenge || {}).message || challenge);
        return res.redirect('/login'); 
      }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
          
        if (req.body.remember) {
          req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
        }
        else {
          req.session.cookie.expires = false; // Cookie expires at end of session
        }
  
        const retUrl = ((req.session || {}).returnTo || '/');
        return res.redirect(retUrl);
      });
    })(req, res, next);

  } catch (error) {
    return next(error);
  }
});

if (process.env.NODE_END == 'development'){
  router.get('/create', async (req, res, next) => {

    try {

      if (process.env.NODE_ENV == 'development'){
        let email = req.query.email;
        let password = req.query.password;

        let newUser = await userController.createUser('local', email, password);
        if (newUser){
          req.flash('success', 'Login created');
          res.render('login',{
            title: 'Login'
          });
        } else {
          next();
        }

      }
      
    } catch (error) {
      return next(error);
    }

  });
}

module.exports = router;