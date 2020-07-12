//Implements a player class

function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
};

class Player{
    constructor(fName, lName, phone, email, age, db){
        //initialize
        /** This class should be used to update player stats */
        this.db = db;
    }

    getStats(){}
}

module.exports.Player = Player