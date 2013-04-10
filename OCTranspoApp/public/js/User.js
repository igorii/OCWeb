/*
 * User
 * Manages login/logout/register functionality, and maintains list of users favourite stops.
 * Responsible for all communication to the server and database concerning user data.
 */

var User = (function (User) {
	var loggedin = false;       // Whether the user is logged in or not

    User.favStops = [];         // A list of the users favourite stops
    User.favRoutes = [];        // A list of the users favourite bus|stop pairs

    // Make initial check whether the user is logged in
    $.post('/loggedIn').done( function(result) { 
        loggedin = result;
        // Load favourite routes if logged in.
        if (loggedin) {
            $.post('/getFavRoutes').done(function(result) {
                User.favRoutes = result;
                User.initializeFavButtons();
            });
        }
    });

    // Creates buttons for the users favourite stops on the sidebar
    User.initializeFavButtons = function() {
        if (User.favRoutes.length > 0) {
            for (var i = 0; i < User.favRoutes.length; i++) {
                Sidebar.addFavRouteButton(User.favRoutes[i].stopID, User.favRoutes[i].routeID);

                // Fill in star
                $('#route-' + User.favRoutes[i].routeID).attr('class', 'icon-star');
                $('#route-' + User.favRoutes[i].routeID).attr('onClick', 'Sidebar.removeFavRoute(' + User.favRoutes[i].stopID + ',' + User.favRoutes[i].routeID + ')');              
            }
        }
    };

    // Returns whether the user is logged in or not using private loggedin variable
	User.isLoggedIn  = function () { return loggedin; };

    // Registers a new user to the database
    User.register    = function (username, password1, password2) { 
		$('#registerPassword1').val('');
		$('#registerPassword2').val('');

        if (password1 != password2)
            return; //TODO:  Let the user know that the passwords did not match

        // Post to the database to insert the new user
        $.post('register', { 'username': username, 'password': password1 }).done(function (result) {
            switch (result) {
                case 'Success':
                    User.login(username, password1);
                    break;

                case 'Username Taken':
                    alert("Username is taken!");
                    break;

                case 'Failure':
                    alert("Registration Failed!");
                    break;
            }
        });
    };

    // Takes a username and passwords, and authenticates the user by checking their
    // credentials in the user database. If successful, the user is logged in.
    User.login = function (username, password) {
		$('#loginPassword').val('');

        // Post to the database to check if the credentials are correct
        $.post('login', { 'username': username, 'password': password }).done(function(result) {
        	switch (result) {
        		case 'User Not Found':
        			document.username = '';
        			loggedin = false;
        			break;

        		case 'Incorrect Password':
        			document.username = '';
        			loggedin = false;
        			break;

        		case 'Login Successful':
        			loggedin = true;
        			document.username = username;

                    //Get favourite routes and display em
                    $.post('/getFavRoutes').done(function(result) {
                        User.favRoutes = result;
                        User.initializeFavButtons();
                    });
        			User.renderLoggedInPanel();
        			break;
        	}

            document.getElementById('userPanel').innerHTML = result;
            if (Sidebar.currentStop) Sidebar.getSummary(Sidebar.currentStop);
        }); 
	};

    // Handle logging the user out
	User.logout = function () {
		if (!loggedin) return;

        // Post to the server to update the servers sessions
        $.post('logout').done(function(result) {
    		document.username = '';
    		loggedin = false;
            User.favRoutes = [];
            User.favStops = [];

    		$('#userPanelLoggedIn').html('');
            $('#favRoutes').html('');

    		$('#userContent').css({visibility:'visible'});
            $('#userContentLoggedIn').css({visibility:'hidden'});

            if (Sidebar.currentStop) Sidebar.getSummary(Sidebar.currentStop);
            return;
        });
	};

    // Check whether a given route is in the users favourites or not
    User.hasFavouriteRoute = function (stopID, routeID) {
        if (User.favRoutes.length === 0) return false;
        var i, j;
        for (i = 0, j = User.favRoutes.length; i < j; ++i)
            if (User.favRoutes[i].stopID === String(stopID) &&
                User.favRoutes[i].routeID === String(routeID))
                return true;
        
        return false;
    }
    
    // Check whether a given stop is in the users favourites or not
    User.hasFavouriteStop = function (stopID) {
        var i, j;
        for (i = 0, j = User.favStops.length; i < j; ++i) 
            if (User.favRoutes[i].stopID === stopID)
                return true;

        return false;
    }

    // Add a favourite stop to the users list of favourite stops
    User.addFavStop = function (stopID) {
        User.favStops.push(stopID);        
    };

    // Add a favourite route|stop pair to the users list of favourites
    User.addFavRoute = function (stopID, routeID) {
        if (User.hasFavouriteRoute(stopID, routeID)) return;
        
        var route = { 'stopID': String(stopID), 'routeID': String(routeID) };
        User.favRoutes.push(route);

        $.post('addFavRoute', {'stopID': stopID, 'routeID': routeID}).done(function() {}); 
    };

    // Remove a route|stop pair from the users list of favourites
    User.removeFavRoute = function(stopID, routeID) {
        if (User.favRoutes.length === 0) return;

        for (var i = 0; i < User.favRoutes.length; i++) {
            if (User.favRoutes[i].stopID === String(stopID) && 
                User.favRoutes[i].routeID === String(routeID)) {
                User.favRoutes.splice(i, 1);
            }
        }
        $.post('removeFavRoute', {'stopID': stopID, 'routeID': routeID}).done(function() {});
    };

    // Renders the User panel for logged in users
    // Currently, this only displays the logout button
	User.renderLoggedInPanel = function () {
		if (!loggedin) return;

        // Hide the login/register panels
		$('#userContent').css({visibility:'hidden'});
        $('#userContentLoggedIn').css({visibility:'visible'});

        // Create and append the logout button to the loggedin panel
		var html = '<button onclick="" title="Logout" id="logout" class="btn btn-custom">Logout</button>';
		document.getElementById('userPanelLoggedIn').innerHTML = html;
		$('#logout').click(User.logout);
	};

	return User;

}(User || {}));

// If the user clicks Login, handle the login
$('#login').click(function() {
    User.login($('#loginName').val(), $('#loginPassword').val());
});

// If the user clicks register, handle the register
$('#register').click(function() {
    User.register($('#registerName').val(), 
                  $('#registerPassword1').val(),
                  $('#registerPassword2').val());
});

// Register all text fields to their appropriate actions
registerEnterPress('#loginName',         '#login');
registerEnterPress('#loginPassword',     '#login');
registerEnterPress('#registerName',      '#register');
registerEnterPress('#registerPassword1', '#register');
registerEnterPress('#registerPassword2', '#register');
