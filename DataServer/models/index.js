//entry point for connecting to any models created in the app
const mongoose = require('mongoose');

//connect to the mongodb of choice
const envVars = require('../app-env.json');
const dbconnection = envVars.DB_STRING;
mongoose.connect(dbconnection);

//export the ranked model
module.exports.Ranked = require("./ranked");