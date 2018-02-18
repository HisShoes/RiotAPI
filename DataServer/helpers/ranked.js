const db = require('../models'),
    request = require('request-promise'),
    cron = require('cron');

const   envs = require('../app-env.json'),
        apiKey = envs.API_KEY,
        personalUsers = envs.USERS,
        personalRegion = envs.REGION;

//first set of function are 'specific purpose' - for use within this file only, so not exported
//functions are used to fill the model and create a current snapshot
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

updateRankedCollection = function(league) {
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
        db.Ranked.findOne({"queueType": mappedObject.queueType, "playerOrTeamName": mappedObject.playerOrTeamName}, function(err, record) {
            if(err) {
                console.log('error:' + err);
            }else {
                if(record) {
                    if(record.snapshots[record.snapshots.length-1].wins !== queue.wins || record.snapshots[record.snapshots.length-1].losses !== queue.losses) {
                        record.snapshots.push(mappedObject.snapshots[0]);
                        record.save();
                    }
                } else {
                    db.Ranked.create(mappedObject);
                }
            }
        })
    })
}

//functions to expose Riot API where required
getSummonerByName = function(region, apiKey, summonerName) {
    return request({
        'method': 'GET',
        'uri': 'https://' + region + '.api.riotgames.com/lol/summoner/v3/summoners/by-name/' + summonerName,
        'json': true,
        'headers': {
            'X-Riot-Token': apiKey
        }
    });
}

getLeagueDetailsById = function(region, apiKey, summonerId) {
    return request({
        'method': 'GET',
        'uri': 'https://' + region + '.api.riotgames.com/lol/league/v3/positions/by-summoner/' + summonerId,
        'json': true,
        'headers': {
            'X-Riot-Token': apiKey
        }
    });
}

//exported specific functions to interact with the DB
exports.pollRiot = function(region, apiKey, summonerName) {
    return getSummonerByName(region, apiKey, summonerName)
    .then(function(summoner) {
        return getLeagueDetailsById(region, apiKey, summoner.id);
    })
    .then(updateRankedCollection)
}


/*
    queueType should be either:
    RANKED_SOLO_5x5
    RANKED_FLEX_SR
*/
exports.getSnapshots = function(req, res) {
    db.Ranked.findOne({"queueType": req.params.queue, "playerOrTeamName": req.params.username}, function(err, record) {
        if(err) {
            res.send(err)
        }else {
            res.json(record);
        }
    })
}

//cron job to automatically poll riot for LP updates for HisShoes
const cronJob = new cron.CronJob('0 */10 * * * *', function() {
    personalUsers.forEach(function(personalUser){
        exports.pollRiot(personalRegion, apiKey, personalUser)
        .then(function(){
            console.log('finished updating '+ personalUser + ' model automatically ' + new Date().toLocaleTimeString());
        })
        .catch(function(err) {
            console.log('failed to update automatically: ' + err);
        })
    })
}, function() {
},
true);

module.exports = exports;