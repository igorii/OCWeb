var User = (function (User) {
	var loggedin = false;

    $.post('/loggedIn').done( function(result) {
        loggedin = result;
    });

	User.isLoggedIn = function () { return loggedin };
    User.setLoggedIn = function ( isLogged ) { 
        loggedIn = isLogged
    };
	User.login = function(username, password) {
		$('#loginPassword').val('');

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
        			User.renderLoggedInPanel();
        			break;
        	}

        	console.log('Login: ' + User.isLoggedIn());
            document.getElementById('userPanel').innerHTML = result;
        }); 
	};

	User.logout = function () {
		if (!loggedin) return;

        $.post('logout').done(function(result) {
    		document.username = '';
    		loggedin = false;

    		$('#userPanelLoggedIn').html('');

    		$('#userContent').css({visibility:'visible'});
            $('#userContentLoggedIn').css({visibility:'hidden'});
            return;
        });
	};

	User.renderLoggedInPanel = function () {
		if (!loggedin) return;

		$('#userContent').css({visibility:'hidden'});
        $('#userContentLoggedIn').css({visibility:'visible'});

		var html = '<button onclick="" title="Logout" id="logout" class="btn">Logout</button>';
		document.getElementById('userPanelLoggedIn').innerHTML = html;
		$('#logout').click(User.logout);
	};

	return User;

}(User || {}));

$('#login').click(function() {
    User.login($('#loginName').val(), $('#loginPassword').val());
});

registerEnterPress('#loginName', '#login');
registerEnterPress('#loginPassword', '#login');