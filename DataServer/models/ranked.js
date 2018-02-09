const mongoose = require('mongoose');


//create the schema
const rankedSchema = new mongoose.Schema({
    "queueType": {type:String},
    "playerOrTeamName": {type:String},
    "playerOrTeamId": {type:String},
    snapshots: [{
        "hotStreak": {type:Boolean},
        "wins": {type:Number},
        "veteran": {type:Boolean},
        "losses": {type:Number},
        "leagueName": {type:String},
        "inactive": {type:Boolean},
        "rank": {type:String},
        "freshBlood": {type:Boolean},
        "leagueId": {type:String},
        "tier": {type:String},
        "leaguePoints": {type:Number},
        "totalLP": {type:Number},
        "date": {type: Date}
    }]  
});

const Ranked = mongoose.model('Ranked', rankedSchema);

module.exports = Ranked;