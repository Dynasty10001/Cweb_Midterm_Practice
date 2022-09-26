const express = require('express');
const router = express.Router();
/* eslint-disable max-len */
// connect to database
const db = require('better-sqlite3')('registry.db', {verbose: console.log});
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// region PETS LOGIN PASSPORT

/** *****
 *  configure passport
 */
passport.use(new LocalStrategy({
// TODO: add options for the login form input names
},
(username, password, done)=> {
  let user;
  try {
    user = db.prepare('SELECT * FROM owners WHERE ownername=? AND password=?').get(username, password);
  } catch (err) {
    return done(err);
  }
  if (!user) {
    return done(null, false, {message: 'User Not Found.'});
  }
  return done(null, user);
},
));

/** ***********
 * GET Login
 */
router.get('/login', (req, res, next) => {
  res.render('pets-login', {
    title: 'GET - LOGIN',
    action: req.baseUrl+ req.path,
    authError: req.query.err,
    // TODO: if a cookie exists for the owners name send the value to the handlebars template

  });
});


/** ***********
 * POST Login
 */
router.post('/login', (req, res, next)=>{
  // TODO: if the user checked  'remember for next time' then set a cookie that last 30 days to remember the ownername for next time

  next();
}, passport.authenticate('local', {
// TODO:  add success redirect to the 'pets-add' page and failure redirects to login with the err query string parameter
}));

// endregion


// region LIST AND VIEW

/** **************************
 * GET LIST
 */
router.get('/', (req, res, next)=>{
  // query for pets in the db
  const sortField = req.query.sortby || 'petname';
  const results = db.prepare(`SELECT * FROM pets ORDER BY ${sortField}`).all();

  res.render('pets-list', {
    title: 'GET - Pets List',
    pets: results,
  });
});

/** **************************
 * GET VIEW
 */
router.get('/view', (req, res, next)=>{
  // query for pet in the db with the license
  const result = db.prepare(`SELECT * FROM pets WHERE license = ?`)
      .get(req.query.license || '00000000');

  res.render('pets-view', {
    title: 'GET - Pets View',
    pet: result,
    addedPets: req.session.addedPets,
  });
});

// endregion


// region PETS ADD

/** **************************
 * GET ADD

 */
// TODO: add the GET handler as per the instructions on index.hbs


/** **************************
 * POST ADD
  */
// TODO:  : add the POST handler as per the instructions on index.hbs

// endregion


module.exports = router;
