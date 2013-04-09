
/**
 * Module dependencies.
 */

var express = require('express')
    , map = require('./routes/map')
    , user = require('./routes/user')
    , http = require('http')
    , path = require('path')
    , database = require('./routes/database')
    , sessions = require('connect-mongo')(express);

var app = express();

var sessionConf = {
    db: {
        db: 'mondb',
        host: '127.0.0.1',
        port: '5000',
        collection: 'sessions'
    },
    secret: 'aY1dxY7sjnb23Gca077Fh'
};

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: sessionConf.secret,
        maxAge: new Date(Date.now() + 3000000),
        store: new sessions(sessionConf.db)
    }));

    app.use(function(req, res, next) {
        res.locals.loggedin = req.session.loggedin;
        next();
    });

    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));    
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

// Routes
app.get('/', map.home);
app.get('/users', user.list);
app.post('/getSummary', map.getSummary);
app.post('/getTrips', map.getTrips);
app.post('/getAllStopsFromDb', database.getAllStops);
app.post('/login', user.userLogin);
app.post('/register', user.userRegister);
app.post('/logout', user.userLogout);
app.post('/loggedIn', user.loggedIn);
app.post('/addFavRoute', database.addUserFavRoute);
app.post('/getFavRoutes', database.getUserFavRoutes);
app.post('/removeFavRoute', database.removeUserFavRoute);

http.createServer(app).listen(app.get('port'), function(){   
        console.log("Express server listening on port " + app.get('port'));
});







