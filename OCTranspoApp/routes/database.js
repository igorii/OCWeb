
// The database module //

var mongo = require('mongoskin');
var mdb = require('mongodb');
var db = mongo.db('localhost:5000/mondb');

var StopsDb = db.collection('stops');
//var StopTimesDb = db.collection('stop_times');
//var RoutesDb = db.collection('routes');
//var TripsDb = db.collection('trips');
var UsersDb = db.collection('users');

// Store stop data as JSON in memory
var stopData;

exports.getAllStops = function(req, res) {
    console.log('Getting all stops');
	StopsDb.find().toArray(function (err, result) {
		console.log('Sending all stops');
        res.json(result);
	});
}

exports.getStopPopularity = function(stopID) {
    StopsDb.find({ stop: stopID }).toArray(function (err, result) {
    	if (err) throw err;
        return result[0].popularity;
    });
}

exports.getUser = function(username, next) {
	UsersDb.find({ 'username': username }).toArray(function (err, result) {
    	if (err) throw err;
        next(result[0]);
    });
}

exports.createUser = function(username, password, callback) {
    UsersDb.insert({ 'username': username, 'password': password });
    callback(true);
    // TODO: Error check, and return false on error
}

exports.addUserFavStop = function(username, stopID, callback) {
    UsersDb.update( {'username': username }, 
                    {'favStops': UsersDb.find({'username': username}).toArray()[0].favStops.push(stopID) });
    callback(true);
}

exports.getUserFavStops = function(username, callback) {
    callback(UsersDb.find( {'username': username} ).toArray()[0].favStops);
}

//exports.incrementPop = function (stopID)



/*
db.collection('stops').find({stop_code: 1225}).toArray(function (err, result) {
	if (result[0] === undefined)
	{
		db.collection('stops').insert({stop_code: 1225, pop: 1});
	}
	var oldpop = result[0].pop;

	db.collection('stops').update({stop_code: 1225}, {$set: {pop: oldpop + 1}});

});
*/
