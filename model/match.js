// Implementation of a match

function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
};

class Match{
    
    constructor(hId, hName, aId, aName, db){
        this.hId = hId;
        this.aId = hId;
        this.hName = hName;
        this.aName = aName;
        this.hScore = 0;
        this.aScore = 0;
        this.db = db;
    }

    update(score){
        // Update the final score to the match and store it in the database
    }

}

module.exports.Match = Match;
