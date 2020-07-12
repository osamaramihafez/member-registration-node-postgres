// Implementation of a league
const Division = require('./division');
const teamClass = require('./team');

function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
};

class League{

    constructor(name, db){
        this.db = db;
        this.name = name;
        this.divisions = {};
        this.teams = {};
    }

    getDivision(div){
        return this.divisions[div];
    }

    getTeam(team){
        return this.teams[team];
    }

    async addDivisions(numDivs, capacity, connect){
        for(var div = 1; div<numDivs+1 ; div++){
            // Current div capacity will always be 16, we can change this later.
            var sql = 'INSERT INTO division (divId, league, capacity) VALUES ($1, $2, $3);';
            await this.db.query(sql, [div, this.name, capacity]).then(res => {
                if (res.rows[0] === null){
                    console.log('Division not added for some reason?');
                    return;
                }
                console.log("Division " + div + " Created");
                this.divisions[div.toString()] = new Division.Division(div, this.db);
            }).catch(e => {
                console.log("\nDIVISION CREATION ERROR!\n", e);
               
                return e;
            })
        }
        connect();
    }

    async getDivisions(){
        var sql = 'SELECT divId from division where league=$1;';
        await this.db.query(sql, [this.name]).then(res => {
            var divBack = this.divs;
            res.rows.forEach((div) => {
                if (!this.divisions[div.divid]){
                    this.divisions[div.divid] = new Division.Division(div.divid, this.db);
                    console.log("Division: " + div.divid + " has been fetched");
                }
            })
        }).catch(e => {
            console.log("\nDIVISION FETCH ERROR!\n", e);
            return e;
        })
    }

    getTeamNames(respond){
        const sql = 'SELECT * from team where league=$1'
        this.db.query(sql, [this.name]).then(result => {
            if (result.rows[0] == null){
                console.log("This league does not currently have any teams.");
                return;
            }
            var divBack = this.teams
            result.rows.forEach(team => {
                if (!this.teams[team.name]){
                    this.teams[team.name] = new teamClass.Team(team.name, this.db);
                    console.log("We got a Team called: " + team.name);
                } else {
                    this.teams[team.name] = divBack[team.name];
                    console.log("We got a Team called: " + team.name);
                }
            })
            // We're returning a json object containing all of the league names
            if (isFunction(respond)) respond({teams: Object.keys(this.teams)});
            return;
        }).catch(e => {
            console.log("\nTeam  FETCH ERROR!\n", e);
            return e;
        })
    }
}

module.exports.League = League;
