//app setup
var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    router = express.Router()
    request = require('request-promise');

//app set up
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));

//import keys, set env vars etc.
var envVars = require('./app-env.json');
var dbconnection = envVars.DB_STRING;
var port = 8080;

//connecto to db
var mongoose = require('mongoose');
mongoose.connect(dbconnection);

//create the schema
var rankedSchema = new mongoose.Schema({
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

var Ranked = mongoose.model('Ranked', rankedSchema);


//functions for interacting with Riot API
function getSummonerByName(region, apiKey, summonerName) {
    return request({
        'method': 'GET',
        'uri': 'https://' + region + '.api.riotgames.com/lol/summoner/v3/summoners/by-name/' + summonerName,
        'json': true,
        'headers': {
            'X-Riot-Token': apiKey
        }
    });
}

function getLeagueDetailsById(region, apiKey, summonerId) {
    return request({
        'method': 'GET',
        'uri': 'https://' + region + '.api.riotgames.com/lol/league/v3/positions/by-summoner/' + summonerId,
        'json': true,
        'headers': {
            'X-Riot-Token': apiKey
        }
    });
}

tierValues = {
    BRONZE: 0,
    SILVER: 500,
    GOLD: 1000,
    PLATINUM: 1500,
    DIAMOND: 2000
};

highEloTiers = 2500;

rankValues = {
    "V": 0,
    "IV": 100,
    "III": 200,
    "II": 300,
    "I": 400
}

//return the 'total lp' the player has got
function consolidateLP(tier, rank, lp) {
    if(tierValues[tier]) {
        return tierValues[tier] + rankValues[rank] + lp;
    } else {
        return highEloTiers + lp;
    }
}

function updateRankedCollection(league) {
    league.forEach(function(queue) {
        //calculate the total lp for each snapshot
        queue.totalLP = consolidateLP(queue.tier, queue.rank, queue.leaguePoints);

        let mappedObject = {
            "queueType": queue.queueType,
            "playerOrTeamName": queue.playerOrTeamName,
            "playerOrTeamId": queue.playerOrTeamId,
            snapshots: [{
                "hotStreak": queue.hotStreak,
                "wins": queue.wins,
                "veteran": queue.veteran,
                "losses": queue.losses,
                "leagueName": queue.leagueName,
                "inactive": queue.inactive,
                "rank": queue.rank,
                "freshBlood": queue.freshBlood,
                "leagueId": queue.leagueId,
                "tier": queue.tier,
                "leaguePoints": queue.leaguePoints,
                "totalLP": queue.totalLP,
                "date": new Date()
            }]  
        }

        //update the db with the details
        Ranked.findOne({"queueType": mappedObject.queueType, "playerOrTeamName": mappedObject.playerOrTeamName}, function(err, record) {
            if(err) {
                console.log('error:' + err);
            }else {
                if(record) {
                    console.log("check update")
                    if(record.snapshots[record.snapshots.length-1].wins !== queue.wins || record.snapshots[record.snapshots.length-1].losses !== queue.losses) {
                        console.log("do update")
                        record.snapshots.push(mappedObject.snapshots[0]);
                        record.save();
                    }
                } else {
                    console.log("create")
                    Ranked.create(mappedObject);
                }
            }
        })
    })
}





//start server
app.listen(port);
console.log('listening on ' + port);
