var User = (function (User) {
	var loggedin = false;

    // Make initial check whether the user is logged in
    $.post('/loggedIn').done( function(result) { loggedin = result; });

	User.isLoggedIn  = function () { return loggedin; };
    User.setLoggedIn = function (isLogged) { loggedIn = isLogged; }; // TODO: Get rid of this... this is dangerous
    User.register    = function (username, password1, password2) { 
		$('#registerpassword1').val('');
		$('#registerPassword2').val('');

        if (password1 != password2)
            //TODO: Handle password mismatch

        $.post('register', { 'username': username, 'password': password1 }).done(function(result) {
            switch (result) {
                case 'Success':
                    User.login(username, password1);
                    break;

                case 'Username Taken':
                    break;

                case 'Failure':
                    break;
            }
        });
    };

    User.login = function (username, password) {
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

$('#register').click(function() {
    User.register($('#registerName').val(), 
                  $('#registerPassword1').val(),
                  $('#registerPassword2').val());
});

registerEnterPress('#loginName',         '#login');
registerEnterPress('#loginPassword',     '#login');
registerEnterPress('#registerName',      '#register');
registerEnterPress('#registerPassword1', '#register');
registerEnterPress('#registerPassword2', '#register');
