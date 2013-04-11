
/*
 * GET users listing.
 */

var database = require('./database');

// Default express route
exports.list = function(req, res){
  res.send("respond with a resource");
};

// Handle a user registration request
// If the username has not been taken, create a new user in the databse
exports.userRegister = function (req, res) {
    database.getUser(req.body.username, function(result) {
        if (result) {
            res.send('Username Taken');
        }

        database.createUser(req.body.username, req.body.password, function (success) {
            if (success)
                res.send('Success');
            else
                res.send('Failure');
        });
    });
};

// Handle a user login request
exports.userLogin = function(req, res) {
	database.getUser(req.body.username, function(result) {
		if (result) {
			if (result.password === req.body.password) {
				req.session.loggedin = true;
				req.session.username = req.body.username;
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

// Handle a user logout request
// Update the session for the user
exports.userLogout = function(req, res) {
	req.session.loggedin = false;
	res.send('Logged out');
};

// Query the sessions to see if the user is already logged in
exports.loggedIn = function(req, res) {
	if (req.session.loggedin){
		res.send(true);
	} else {
		res.send(false);
	}
}

