
/*
 * GET users listing.
 */

var database = require('./database');

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.userLogin = function(req, res) {
	database.getUser(req.body.username, function(result) {
		if (result) {
			if (result.password === req.body.password) {
				res.send('Login Successful');
			}
			res.send('Incorrect Password');
		}
		res.send('User Not Found');
	});
};

exports.authenticated = function(req, res, next) {
	if (req.session.username){
		res.send('You are not authorized to view this page');
	} else {
		next();
	}
};