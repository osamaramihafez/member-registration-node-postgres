// This is the node file, this is where are all of the http requests are handled
// and where the database is accessed
var port = 3001;

const express = require('express');
const bodyParser = require('body-parser');
const Client = require('pg').Client;

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port, function () {
    console.log('member-registration listening on port ' + port);
});

const db = new Client({
  user: 'maadmin',
  password: 'VeryG00dPa$$word',
  host: 'localhost',
  port: 5432,
  database: 'website'
})

db.connect()
.then(() => console.log('Connected to db successfully'))
.catch(e => console.log(e));

function isFunction(functionToCheck) {
  // This is just a helper function that checks if any "callback" functions actually exist

  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
};

function createMember(body, callBack){  
  // This function adds someone who is newly registered to the database.
  // This function should return the member ID.

  var id;
  var sql = 'INSERT INTO member (fname, lname, phone, email, age, gender) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;';
  db.query(sql, [body.fname, body.lname, body.phone, body.email, body.age, body.gender]).then(res => {
      id = res.rows[0].id;
      if (id) {
        callBack(body);
        console.log("New member with id: " + id);
      }
  }).catch(e => {
      if (e.code == '23505'){
        console.log("\n ERROR! \n Individual with name: " + body.fname + " " + body.lname + " and phone #: " + body.phone + " is a duplicate member. \n");
        callBack("Duplicate");
        return;
      }
      console.log("\n \n ERROR! \n Individual with name: " + body.fname + " " + body.lname + " and phone #: " + body.phone + " cannot be added. \n", e);
      callBack(false);
      return e;
  })
}

function register(body, callback){
  // This function registers a member to a program, if the member does not exist, then we add them to the member table first.
  // If the member does exist, then we continue to register them.

  if (!memberExists(body, callback)){
    createMember(body, registerMember);
  } else {
    registerMember(body, callback);
  }
}

function registerMember(body, callback){
  // This function inserts a member into the database
  getMember(body, member_id => {
    console.log("Member with ID: " + member_id + " being registered for " + body.program)
    var sql = 'INSERT INTO programMember (member, program) VALUES ($1, $2) RETURNING member;';
    db.query(sql, [member_id, body.program]).then(res => {
        // id = res.rows[0].member;
        if (member_id) callback(body);
    }).catch(e => {
        callback(false);
        console.log("\n ERROR! \n Individual with name: " + body.fname + " " + body.lname + " caused an error in registerMember \n", e);
        return e;
    })
  });
}

async function memberExists(body, callBack){
  // This function checks to see if the member already exists in the database.
  var id;
  var sql = 'SELECT id FROM member WHERE fname=$1 and lname=$2 and phone=$3;';
  return await db.query(sql, [body.fname, body.lname, body.phone]).then(res => {
      id = res.rows[0].id;
      if (!id) console.log("Member with name" + body.fname + " " + body.lname + " and phone #: " + body.phone + "does not exist");
  }).catch(e => {
      if (e.code == '23505'){
        console.log("\n ERROR! \n Individual with name: " + body.fname + " " + body.lname + " and phone #: " + body.phone + " is a duplicate member. \n");
        callBack("Duplicate");
        return;
      }
      callBack(false);
      console.log("\n ERROR! \n Individual with name: " + body.fname + " " + body.lname + " and phone #: " + body.phone + " caused an error in memberExists function. \n");
  });
}

async function getMember(body, callBack){
  // This function retreives (gets) a member's id from the database.
  var id;
  var sql = 'SELECT id FROM member WHERE fname=$1 and lname=$2 and phone=$3;';
  await db.query(sql, [body.fname, body.lname, body.phone]).then(res => {
      id = res.rows[0].id;
      console.log("We got member with ID: " + id)
      if (id) { callBack(id) } else { console.log("This member does not exist") };
      return id;
  }).catch(e => {
      console.log("\n ERROR! \n Individual with name: " + body.fname + " " + body.lname + " and phone #: " + body.phone + " caused an error in getMember function.\n", e);
      callBack(false);
      return e;
  })
  return id;
}

// Also Need an API that responds with a list of all registered individuals for a certain program.

INTERNALERROR = {error: "Server Could not process the request"}
DUPLICATE = {error: "Duplicate"}

app.post('/api/addMember', (req, res) => {
  createMember(req.body,  member => {
    if (member == false){
      res.status(500);
      res.json(INTERNALERROR);
      return;
    }
    if (member == "Duplicate"){
      res.status(500);
      res.json(DUPLICATE);
      return;
    }
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200); //This needs a check
    res.json(member);
  });
})

app.get('/api/getMember', (req, res) => {
  getMember(req.body,  member_id => {
    if (member_id == false){
      res.status(500);
      res.json(INTERNALERROR);
      return;
    }
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200); //This needs a check
    res.json({id:member_id});
  });
})

app.post('/api/register', (req, res) => {
  register(req.body, status => {
    if (status == false){
      res.status(500);
      res.json(INTERNALERROR);
      return;
    }
    res.set('Access-Control-Allow-Origin', '*');
    res.status(200); //This needs a check i.e. if status.registered = true
    res.json(status);
  });
})