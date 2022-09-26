/* eslint-disable max-len */
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
// require passport to make authentication / authorization easier
const passport = require('passport');
passport.serializeUser((user, done)=>{
  done(null, user);
});
passport.deserializeUser((user, done)=>{
  done(null, user);
});
// require packages to implement Sessions in express
const session = require('express-session');
// helps store session in an sqlite database
const SqliteStore = require('better-sqlite3-session-store')(session);
const sessOptions = {
  // set secret from environment variable used to encode the session cookie
  secret: 'shhhhh_this-is+SECret', // should be the same for cookie-parser
  name: 'session-id', // name of the session cookie default: connect.sid
  resave: false, // store session after every request
  saveUninitialized: true, // if true sets a cookie even if no session info is stored
  cookie: {httpOnly: false, maxAge: 1000*60*60}, // cookie options - see cookie-parser docs
  unset: 'destroy', // instruction for stored session when unset
  store: new SqliteStore({ // a location to store session besides the memory
    client: require('better-sqlite3')('sessions.db', {}),
    expired: {clear: true, intervalMs: 1000*60*15},
  }),
};


const indexRouter = require('./routes/index');
const petsRouter = require('./routes/registry');
// TODO: add the registry router


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser(sessOptions.secret)); // use same secret as session
// configure session session options
app.use(session(sessOptions));
// configure passport to create the req.currentUser property with the token payload
// in order to use passport with express we need to initialize passport
app.use(passport.initialize( {userProperty: 'authenticatedUser'}));
app.use(passport.session());


app.use(express.static(path.join(__dirname, 'public')));
app.use('/bw', express.static( 'node_modules/bootswatch/dist'));
app.use('/bs', express.static( 'node_modules/bootstrap/dist'));

app.use('/', indexRouter);
app.use('/pets', petsRouter);
// TODO: add the path for the registry router


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
