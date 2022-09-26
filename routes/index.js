const express = require('express');
const router = express.Router();
// connect to database
const db = require('better-sqlite3')('registry.db', {verbose: console.log});

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.query.initDB) {
    db.exec(`DROP TABLE IF EXISTS pets`);
    db.exec(`DROP TABLE IF EXISTS owners`);

    db.exec(`CREATE TABLE pets
  (
    license INTEGER PRIMARY KEY,
    petname VARCHAR(50) NOT NULL,
    pettype VARCHAR(20) NOT NULL,
    petimage VARCHAR(50) NOT NULL,
    ownername VARCHAR(50) NOT NULL
  )`);
    db.exec(`CREATE TABLE owners
  (
    id INTEGER PRIMARY KEY,
    ownername VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    role VARCHAR(50) NOT NULL
  )`);

    const ownerStmt = db.prepare(`insert into owners (id,ownername,password,role) values (?,?,?,?)`);
    const petStmt = db.prepare(`insert into pets (license,ownername, petimage,petname, pettype) values (?,?,?,?,?)`);
    let info;
    info = ownerStmt.run(1, 'Sally', '234abcd', 'admin');
    console.log(info.changes);
    info = ownerStmt.run(2, 'Bob', '678efgh', 'owner');
    console.log(info.changes);
    info = ownerStmt.run(3, 'Darren', '012ijkl', 'owner');
    console.log(info.changes);
    info = ownerStmt.run(4, 'Gwen', '456mnop', 'owner');
    console.log(info.changes);

    info = petStmt.run(12345678, 'Bob', 'DO-NOT-REMOVE-rover.png', 'Rover', 'dog');
    console.log(info.changes);
    info = petStmt.run(23456789, 'Bob', 'DO-NOT-REMOVE-bliss.png', 'Bliss', 'cat');
    console.log(info.changes);
    info = petStmt.run(34567890, 'Darren', 'DO-NOT-REMOVE-cutey.png', 'Cutey', 'bird');
    console.log(info.changes);
    info = petStmt.run(45678901, 'Darren', 'DO-NOT-REMOVE-polly.png', 'Polly', 'bird');
    console.log(info.changes);
    info = petStmt.run(56789012, 'Gwen', 'DO-NOT-REMOVE-no-image.png', 'Fluffy', 'cat');
    console.log(info.changes);
    info = petStmt.run(67890123, 'Gwen', 'DO-NOT-REMOVE-bella.png', 'Bella', 'cat');
    console.log(info.changes);
    info = petStmt.run(78901234, 'Sally', 'DO-NOT-REMOVE-no-image.png', 'Gilbert', 'fish');
    console.log(info.changes);
    info = petStmt.run(89012345, 'Sally', 'DO-NOT-REMOVE-no-image.png', 'Oberon', 'hamster');
    console.log(info.changes);

    console.log(db.prepare(`SELECT * FROM owners`).all());
    console.log(db.prepare(`SELECT * FROM pets`).all());
  }
  res.render('index', {title: 'Neighbourhood Pet Registry'});
});

module.exports = router;
