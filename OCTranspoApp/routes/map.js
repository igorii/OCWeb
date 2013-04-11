/*
 * Main application module
 *
 */

(function () {
    "use strict";

    var request = require('request')
        , xml2js = require('xml2js')
        , ocTranspoKey = '3dbaa821f9f7dbc2cd5ec52f8ceaff63'
        , ocTranspoID = '59bd2043'
        , database = require('./database');

    // Main handler for GET requests to /
    exports.home = function(req, res) {
        var ua = req.header('user-agent');
        
        // If the request is from a mobile user-agent, render
        // the mobile version, otherwise render the main version
        if(/mobile/i.test(ua)) {
            res.render('homeMobile', {
                title: 'OCTranspo App',
                layout: 'layoutMobile'
            });
        } else {
            res.render('home', {
                title: 'OCTranspo App'
            }); // Use default layout
        }
    };

    // Handler for getting trips
    exports.getSummary = function(req, res) {
        console.log('Incoming request for stop - ' + req.body.stopID);

        database.incrementStopPop(req.body.stopID);

        // Generate POST request body
        var body = 'appID=' + ocTranspoID + '&apiKey=' + ocTranspoKey;
        body += '&stopNo=' + req.body.stopID;

        // Query OCTranspo servers for stop summary
        request({
            uri: 'https://api.octranspo1.com/v1.1/GetRouteSummaryForStop',
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }, function (error, response, body) {
            var js = xml2js.parseString(body, function (err, result) {
                
                // Try extracting the interesting information from the
                // verbose result object. Send an error message to the 
                // client on failure
                try {
                    result = result['soap:Envelope']['soap:Body'][0]['GetRouteSummaryForStopResponse'][0]['GetRouteSummaryForStopResult'][0];
                    res.send(JSON.stringify(result));
                } catch (e) {
                    res.send(JSON.stringify({error: 'invalid response'}));
                }
            })
        });
    };

    // Handler for getting trips
    exports.getTrips = function(req, res) {
        console.log('Incoming request for stop - ' + req.body.stopID);       

        // Generate POST request body
        var body = 'appID=' + ocTranspoID + '&apiKey=' + ocTranspoKey;
        body += '&stopNo=' + req.body.stopID;
        body += '&routeNo=' + req.body.routeNo;

        // Query OCTranspo servers for stop summary
        request({
            uri: 'https://api.octranspo1.com/v1.1/GetNextTripsForStop',
            method: 'POST',
            body: body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }, function (error, response, body) {
            xml2js.parseString(body, function (err, result) {
                result = result['soap:Envelope']['soap:Body'][0]['GetNextTripsForStopResponse'][0]['GetNextTripsForStopResult'][0]['Route'][0]['RouteDirection'][0];
                res.send(JSON.stringify(result));
            })
        });
    };
}());
