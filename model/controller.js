// For now, this will be a temporary controller until we set up all of the mongo and react stuff.
var league;

function initializeSeason(){
    league = new League(2);
    console.log(league);
}

function registerTeam(name, division){
    var div = parseInt(division);
    console.log(div);
    // console.log(league)
    league.addTeam(div, new Team(name, div));
    league.divisions[div].getMatches();
}