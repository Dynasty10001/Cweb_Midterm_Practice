const express = require('express');
const router = express.Router();
/* eslint-disable max-len */
// connect to database
const db = require('better-sqlite3')('registry.db', {verbose: console.log});
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const multer = require('multer');
const upload = multer({
  dest: 'public/uploads/',
  limits: {filesize: 10*1024*1024}, // superb good way to prevent malicious attacks
  fileFilter: (req, file, callback)=>{
    if (file.mimetype.startsWith('image/png')) {
      return callback(null, true); // file mimetype is allowed
    } else {
      return callback(new Error('Image Must be a png over 2MB'));
    }
  },
});// tempoarary file storage

const fs = require('fs'); // file system functions

// we just need 3 modules from the express validator package body, query, and validationResult
const {body, query, validationResult} = require('express-validator');

// custom error formatter to help traverse the fields and error messages

const onlyMsgErrorFormatter = ({location, msg, param, value, nestedErrors}) => {
  return msg; // only return the message of the error
};


/**
 * moves files from the temp location to the specified folder
 * @param tempFile - current file info object
 * @param newPath - String path to new folder location
 */
function moveFile(tempFile, newPath) {
// append filename and original name to the path
  newPath += tempFile.filename + ' - ' + tempFile.originalname;
  fs.rename(tempFile.path, newPath, (err)=>{
    // if there is a file system error just throw the error for now
    if (err) throw err;
    console.log('File Moved to ' + newPath);
  });
}

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
router.get('/add', function(req, res, next) {
  res.render('pets-add', {
    title: 'GET - Add-a-Pet',
  });
});
// TODO: add the GET handler as per the instructions on index.hbs


/** **************************
 * POST ADD
  */
router.post('/add', upload.fields([{name: 'petimage', maxCount: 1}]), [
  body('license').trim().notEmpty().withMessage('License number is required').bail(),
  body('license').trim().isNumeric().isLength({min: 8, max: 8}).withMessage('License must be 8 digits long').bail(),
  body('petname').trim().notEmpty().withMessage('Pet Name is required').bail(),
  body('petname').trim().isLength({max: 50}).withMessage('Pet Name is required').bail(),
  body('pettype').trim().notEmpty().withMessage('Pet Type is required').bail(),
  body('ownername').trim().notEmpty().withMessage('Owner Name is required').bail(),
  body('petimage').custom((value, {req}) => {
    if (req.files.petimage && req.files.petimage[0].size<2*1024*1024) {
      throw new Error('Uploaded file must be at least 2MB in size');
    }
    return true; // Indicates the success of this synchronous custom validator
  }),
], (req, res, next) => {
  const violations = validationResult(req);
  console.log('Violations\n');
  console.log(violations.formatWith(onlyMsgErrorFormatter).mapped());

  // format the violations into a very simple object with properties
  const errorMessages = violations.formatWith(onlyMsgErrorFormatter).mapped();
  if (errorMessages.petimage) {
    fs.unlink(req.files.petimage.path, (err)=> {
      if (err) throw err;
      console.log('File removed at ' + req.files.petimage.path);
    });
  } else {
    moveFile(req.files.petimage, __dirname + '/../public/images/');
  }

  res.render('pets-add', {
    title: 'POST - Add-a-Pet',
    submittedPetName: req.body.petname,
    submittedPetType: req.body.pettype,
    submittedOwnerName: req.body.ownername,
    submittedLicense: req.body.license,
    err: errorMessages,
  });
});
// TODO:  : add the POST handler as per the instructions on index.hbs

// endregion


module.exports = router;
