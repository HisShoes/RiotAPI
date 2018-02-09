//app setup
const express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    router = express.Router()
    request = require('request-promise');

//app set up
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));

//get the routes to use to interface with riots API and the mongoDB stored data
const rankedRoutes = require('./routes/ranked.js');
app.use('/ranked/', rankedRoutes);

//start server
const port = 8080;
app.listen(port);
console.log('listening on ' + port);





