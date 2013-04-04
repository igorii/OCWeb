
// The database module //

var mongo = require('mongoskin');
var mdb = require('mongodb');
var db = mongo.db('localhost:27017/mondb');

var StopsDb = db.collection('stops');
//var StopTimesDb = db.collection('stop_times');
//var RoutesDb = db.collection('routes');
//var TripsDb = db.collection('trips');
var UsersDb = db.collection('users');
var MaxPop = db.collection('maxPop');

// Store stop data as JSON in memory
var stopData;

exports.getAllStops = function(req, res) {
    console.log('Getting all stops');
	StopsDb.find().toArray(function (err, routes) {
		console.log('Sending all stops');
        MaxPop.find(0).toArray(function (err, maxPop) {
            res.json( {'max': maxPop, 'routes': routes} );
        });
	});
}

exports.getStopPopularity = function(stopID) {
    StopsDb.find({ stop_code: stopID }).toArray(function (err, result) {
    	if (err) throw err;
        return result[0].popularity;
    });
}

exports.incrementStopPop = function(stopID) {
    console.log("WARG");
    StopsDb.find( {stop_code: Number(stopID) } ).toArray(function (err, result) {
        if (err) throw err;
        var newPop = result[0].popularity + 1;
        console.log("Updating stop " + stopID + " pop to newPop: " + newPop);
        StopsDb.update({stop_code: Number(stopID)}, {$set: { popularity: newPop } });

        MaxPop.find(0).toArray(function (err, maxPop) {
            if (newPop > maxPop[0]['value']) {
                MaxPop.update({}, { value: newPop} );    
            }            
        });
    });
}

exports.getUser = function(username, next) {
	UsersDb.find({ 'username': username }).toArray(function (err, result) {
    	if (err) throw err;
        next(result[0]);
    });
}

exports.createUser = function(username, password, callback) {
    UsersDb.insert({ 'username': username, 'password': password, 'favStops': []});
    callback(true);
    // TODO: Error check, and return false on error
}

exports.addUserFavRoute = function(req, res) {
    UsersDb.find({'username': req.session.username}).toArray(function(err, result) {        
        var newFavStops = Array.prototype.slice.call(result[0].favStops);
        newFavStops.push({ 'stopID': req.body.stopID, 'routeID': req.body.routeID });  
        UsersDb.update( {'username': req.session.username }, {$set: {'favStops': Array.prototype.slice.call(newFavStops)}});
    });
    res.send('Successfully Added Fav Route');
}

exports.removeUserFavRoute = function(req, res) {
    UsersDb.find({'username': req.session.username}).toArray(function(err, result) {        
        var newFavStops = Array.prototype.slice.call(result[0].favStops);
        for (var i = 0; i < newFavStops.length; i++) {
            if (newFavStops[i].stopID === req.body.stopID && newFavStops[i].routeID === req.body.routeID) {
                newFavStops.splice(i, 1);
                break;
            }
        } 
        UsersDb.update( {'username': req.session.username }, {$set: {'favStops': Array.prototype.slice.call(newFavStops)}});
    });
    res.send('Successfully Removed Fav Route');
}

exports.getUserFavRoutes = function(req, res) {
    var userFavStops = [];
    UsersDb.find( {'username': req.session.username} ).toArray(function(err, result) {
        userFavStops = Array.prototype.slice.call(result[0].favStops);
        res.send(userFavStops);
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
