//routes to get data
var express = require('express'),
    router = express.Router(),
    helpers = require('../helpers/ranked');


//gets summoner information from Riots API then stores it in MongoDB on mlab
router.post('/pollRiotAPI', function(req, res) {
    helpers.pollRiot(req.body.region, req.body.apiKey, req.body.summonerName)
    .then(function() {
        res.send({status: 200});
    })
    .catch(function(err) {
        res.send({message: "there's a problem: " + err});
    });
});

router.get('/snapshots/:username/:queue', helpers.getSnapshots);


module.exports = router;