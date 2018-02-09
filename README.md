Polls the RIOTAPI for LP per time run per queue for a given user.

Stores snapshots of the users info in each ranked queue every time it's run, can then be compared/processed/displayed at a later date.

TODO:
* Finish creating end points to get data
* Set up server to serve some simple HTML web pages
* Adding front end with D3.js


HOW TO USE:

If you want to use this project for your own you'll need to set up a mongoDB to store your data on and get a RIOT API Key.

* I've used mlab for the DB - it's really easy to get set up on there - they'll give you the string you need to put in the file for DB_STRING
* Get the API_KEY from Riot directly, unless you get your app verified you'll need to renew it daily
* Use your username and get the region required by Riots API. euw1 is for euw.

The app-env.json file should follow the format:

{
    "DB_STRING": "mongodb://<<DB_USER_NAME>>:<<DB_PASSWORD>>@<<DATABASE>>",
	"API_KEY": "<<API_KEY_FROM_RIOT>>",
    "USERS": ["<<USERNAME1>>", "<<USERNAME2>>"...],
    "REGION": "<<REGION>>"
}