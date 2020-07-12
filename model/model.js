
const Client = require('pg').Client;
const db = new Client({
  user: 'maadmin',
  password: 'VeryG00dPa$$word',
  host: 'localhost',
  port: 5432,
  database: 'maadmin'
})

db.connect()
.then(() => console.log('Connected to db successfully'))
.catch(e => console.log(e));

const League = require('./league.js')

var users = {};

module.exports.users =  users;

function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
};

module.exports.createAccount = function createAdmin(username, password, respond){
    var sql = "INSERT INTO admin (username, password) VALUES ($1, $2) RETURNING *";
    db.query(sql, [username, password]).then(result => {
        //If the rows are empty, then that means that this admin does not currently organize a league. 
        if (result.rows[0] == null){
            console.log("This admin was not created.");
            if (isFunction(respond)) respond({success: false});
            return;
        }
        if (isFunction(respond)) respond({success: true});
        return;
    }).catch(e => {
        console.log("\nADMIN CREATION ERROR!\n");
        console.log(e);
        if (isFunction(respond)) respond({success: false});
        return e;
    })
}

module.exports.logout = function logout(username){
    delete users[username];
}

module.exports.login = function login(username, password, respond){
    /*This login function should do two things:
         1. Check to see if the login credentials for an admin are valid
         2. Create an admin object based on the valid credentials
    */
    var sql = 'SELECT password FROM admin WHERE username=$1;';
    db.query(sql, [username]).then(result => {
        var login = {
        success: false
        }
        var admin;
        if (result.rows[0] == null){
            console.log("Username does not exist.");
            if (isFunction(respond)) respond(login);
            return;
        }
        var correctPass = result.rows[0].password;
        if (password === correctPass){
            login.success = true
            admin = new Admin(username);
            users[username] = admin;
            console.log("Password correct.");
            if (isFunction(respond)) respond(login);
            return;
        }
        console.log("Password incorrect.");
        if (isFunction(respond)) respond(login);
        return;
    }).catch(e => {
        console.log("\nLOGIN ERROR!\n");
        console.log(e);
        return e;
    })
}

class Admin{
    constructor(username){
        //Each administrator should have a name (id) and a set of leagues.
        this.name = username;
        this.leagues = {};
    }

    getLeague(league){
        return this.leagues[league];
    }

    getLeagueNames(respond){
        var sql = 'SELECT leagueName FROM leagueAdmin WHERE admin=$1;';
        var name = this.name
        db.query(sql, [name]).then(result => {

            //If the rows are empty, then that means that this admin does not currently organize a league. 
            if (result.rows[0] == null){
                console.log("The admin \""+ name +"\" does not currently organize a league.");
                if (isFunction(respond)) respond({});
                return;
            }
            //We want to create a league object for each league that we fetched so that we can access them later.
            result.rows.forEach(sqleague => {
                if (!this.leagues[sqleague.leaguename]){
                    this.leagues[sqleague.leaguename] = new League.League(sqleague.leaguename, db);
                    // this.leagues[sqleague.leaguename].getDivisions(); //We need to make sure the leagues have their divisions attached to them
                    console.log("We got a league called: " + sqleague.leaguename);
                }
            })

            // We're returning a json object containing all of the league names
            if (isFunction(respond)) respond({leagues: Object.keys(this.leagues)});
            return this.leagues;
        }).catch(e => {
            console.log("\nLEAGUE FETCH ERROR!\n");
            console.log(e);
            return e;
        })
    }

    connectLeague(leagueName){
        //This function connects a league to an administrator.
        var sql = 'INSERT INTO leagueAdmin (leagueName, admin) VALUES ($1, $2) RETURNING *;';
        var admin = this.name
        console.log("Connecting " + leagueName + " to " + admin);
        db.query(sql, [leagueName, admin]).then(result => {
            if (result.rows[0] == null){
                console.log("Did not connect "+ leagueName + " to" + admin);
                return;
            }
            console.log("Connected "+ leagueName + " to " + admin);
            return;
        }).catch(e => {
            console.log("\nLEAGUE CONNECTION ERROR!\n");
            console.log(e);
            return e;
        })
    }

    async addLeague(body, respond){
        /**
         First we will add a league to the database, then connect it to an admin using connectLeague
         body: the request body.
         respond: the call back function. 
         */
        var sql = 'INSERT INTO league (leaguename) VALUES ($1) RETURNING *;';
        console.log(body.leaguename);
        await db.query(sql, [body.leaguename]).then(result => {

            //If we have null returned, what does that mean?
            if (result.rows[0] == null){
                console.log("Did not add " + body.leaguename + " to leagues");
                if (isFunction(respond)) respond({success: false});
                return;
            }

            // Now that we've added the league, we first want to add some divisions to the league
            var league = new League.League(body.leaguename, db);
            league.addDivisions(parseInt(body.numDivs), body.divCapacity, () => {
                this.leagues[body.leaguename] = league;

                //We also want to connect the league to the admin
                this.connectLeague(body.leaguename);
                if (isFunction(respond)) respond({success: true});
                return;
            })
        }).catch(e => {
            console.log("\nLEAGUE CREATION ERROR!\nTHIS LEAGUE LIKELY ALREADY EXISTS.\n");
            if (isFunction(respond)) respond({
                succes: false,
                error: "ALREADY EXISTS"
            })
            console.log(e);
            return;
        })
    }

    login(username, password, respond){
        var sql = 'SELECT password FROM admin WHERE username=$1;';
        db.query(sql, [username]).then(result => {
            var login = {
            success: false
            }
            if (result.rows[0] == null){
                console.log("Username does not exist.");
                if (isFunction(respond)) respond(login);
                return;
            }
            var correctPass = result.rows[0].password;
            if (password === correctPass){  
                login.success = true
                this.name = username;
                console.log("Password correct.");
                if (isFunction(respond)) respond(login);
                return;
            }
            console.log("Password incorrect.");
            if (isFunction(respond)) respond(login);
            return;
        }).catch(e => {
            console.log("\nLOGIN ERROR!\n");
            console.log(e);
            return e;
        })
    }
}
