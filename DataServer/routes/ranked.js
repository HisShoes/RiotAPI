//routes to get data



//gets summoner information from Riots API then stores it in MongoDB on mlab
app.post('/pollRiotAPI', function(req, res) {
    getSummonerByName(req.body.region, req.body.apiKey, req.body.summonerName)
    .then(function(summoner) {
        return getLeagueDetailsById(req.body.region, req.body.apiKey, summoner.id);
    })
    .then(updateRankedCollection)
    .then(function() {
        res.send({status: 200});
    })
    .catch(function(err) {
        res.send({message: "there's a problem: " + err});
    });
});