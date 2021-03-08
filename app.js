// require CLS as first item to ensure asyncListener polyfill modifies Node core correctly

let continuationLocalStorage = require('cls-hooked');

const namespaceName = 'com.dataclear.tenant';
let globalNs = continuationLocalStorage.createNamespace(namespaceName);

let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let auth = require('connect-ensure-login');
let session = require('express-session');
let mongoSessionStore = require('connect-mongo').default;
let flash = require('connect-flash');

// Login and Auth
let passportController = require('./controllers/passportController');
let PassportLocalStrategy = require('passport-local').Strategy;

// Database modules
let mongoose = require('mongoose');

// Tenancy
let namespaceController = require('./controllers/namespaceController');


// Route objects
let indexRouter = require('./routes/index');
let loginRouter = require('./routes/login');
let logoutRouter = require('./routes/logout');
let tenantRouter = require('./routes/tenantRouter');
let orgRouter = require('./routes/orgRouter');

// Login modules
let passport = require('passport');

// Database logon
mongoose.connect(process.env.db_uri,{ useNewUrlParser: true });
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console,'MongoDB connection error:'));

passport.serializeUser(passportController.serializeUser);

passport.deserializeUser(passportController.deserializeUser);


// Main Express Object
let app = express();

// Initiate namespace
app.use(namespaceController.bindCurrentNamespace(globalNs));
// require tenant controller after namespace initialised
let tenantController = require('./controllers/tenantController');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Setup passport sessions
app.use(session({
  store: mongoSessionStore.create({
    mongoUrl: process.env.db_uri,
    ttl: (1 * 60 * 20),
    checkPeriod: 86400000,
    autoRemove: 'native'
  }),
  secret: process.env.sessionsecret,
  resave: true,
  saveUninitialized: false,
  name: 'nosniff_id',
  cookie: {
    maxAge: 1000 * 60 * 20,
    rolling: true,
    secure: ('production' === app.get('env')), // In production, ensures cookies are only transferred via https
    domain: '.' + process.env.domain
  }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new PassportLocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, passportController.passportLogin));




// Retrieve subdomain and save into session
app.use(tenantController.setTenant);

// Flash messages
app.use(flash());

// Pug Locals
// set user letiables for user detail in global layout
app.use((req, res, next) => {
  
  // Setup session user
  let user = ((req.session || {}).passport || {}).user;
  if (user) {
    res.locals.localUser = user;
  } else {
    res.locals.localUser = null;
  }
  // Setup tenant data
  let tenant = (req.session || {}).tenant;
  if (tenant) {
    res.locals.tenant = tenant;
  } else {
    res.locals.tenant = null;
  }

  res.locals.port = process.env.port;


  // Load flash messages

  let msg = req.flash();
  res.locals.messages = msg;

  next();
});

app.locals.moment = require('moment');

// Unauthenticated routes & resources
app.use('/logout', logoutRouter);
app.use('/login', loginRouter);

// Authentication middleware
app.use(auth.ensureLoggedIn('/login'));

// Tenant access middleware
app.use(tenantController.ensureTenantAccess('/login'));

// Authenticated routes
app.use('/', indexRouter);

// restrict tenant route to base
app.use('/tenants', tenantController.restrictToBase, tenantRouter);
app.use('/orgs', orgRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, _next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err);
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
