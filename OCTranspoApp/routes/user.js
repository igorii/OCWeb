
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
				req.session.loggedin = true;
				res.send('Login Successful');
				return;
			}
			res.send('Incorrect Password');
			return;
		}
		res.send('User Not Found');
		return;
	});
};

exports.userLogout = function(req, res) {
	req.session.loggedin = false;
	res.send('Logged out');
};

exports.loggedIn = function(req, res) {
	if (req.session.loggedin){
		res.send(true);
	} else {
		res.send(false);
	}
};