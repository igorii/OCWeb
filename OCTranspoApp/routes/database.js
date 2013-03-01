
// The database module //

var mongo = require('mongoskin');
var mdb = require('mongodb');
var db = mongo.db('localhost:27017/mondb');

var StopsDb = db.collection('stops');
var StopTimesDb = db.collection('stop_times');
var RoutesDb = db.collection('routes');
var TripsDb = db.collection('trips');

// Store stop data as JSON in memory
var stopData;


exports.getAllStops = function(req, res) {
	StopsDb.find().toArray(function (err, result) {
		res.json(result);
	});
}

exports.getSingleStop = function(req, res) {
	StopsDb.find().toArray(function (err, result) {
		res.json(result);
	});
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