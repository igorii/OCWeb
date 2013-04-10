// Check whether the user is accessing the app from a desktop or mobile browser
var isMobile = mobilecheck();

/*
 * Sidebar
 * Creates an object that is responsible for managing the state of the sidebar. All
 * communication to the database concerning stop summaries and bus arrival times are
 * handled by this object. 
 */

var Sidebar = (function (Sidebar) {

    Sidebar.lastRoute       = null;             // Whether the current route is the last of the day
    Sidebar.lastBusMarker   = null;             // A reference to the bus marker from the last request
    Sidebar.lastRouteMarker = null;             // A reference to the Stop marker from the last request
    Sidebar.modes = {  SUMMARY:0, DIRECTIONS:1, USER:2, ABOUT:3 };  // Enum for sidebar contexts
    Sidebar.currMode = Sidebar.modes.SUMMARY;                       // The current context of the sidebar
    Sidebar.currentStop = 0;                    // The currently selected stop

    // Creates a secondary sidebar beside the original sidebar responsible
    // for displaying stops that match the requested stop by name. These
    // stops can be clicked to get a summary for the stop.
    Sidebar.createSecondary = function() {

        // If the sidebar2 already exists, return
        if (document.getElementById('sidebar2') !== null)
            return;

        // Otherwise, create the sidebar2
        var sideBar2 = document.createElement('div');
        sideBar2.id = 'sidebar2';
        $(sideBar2).css( {
            left: 390 + 'px',
            position: 'absolute',
            height: 100 + '%',
            width: 0 + 'px'
        });

        // Create a div to store the match results
        var results = document.createElement('div');
        results.id = 'stopMatchResults';
        $(results).css ({
            top: document.getElementById('sidebarContent').offsetTop +
                 document.getElementById('summaryResults').offsetTop + 'px',
            position: 'absolute'
        });
        sideBar2.appendChild(results);
        document.getElementById('container').appendChild(sideBar2);

        // Move the map_canvas over to make room for the new sidebar2
        // This is animated to match the movement of the sidebar2
        $('#map_canvas').animate({ width: document.getElementById('map_canvas').clientWidth - 300 + 'px'});
        $(sideBar2).animate({ width: 300 + 'px' });
    }

    // Removes the secondary sidebar from the view
    Sidebar.removeSecondary = function ()
    {

        // If the sidebar does not exist, return
        if (document.getElementById('sidebar2') === null)
            return;

        // Otherwise, animate the sidebar in, and delete all of its children
        $('#sidebar2').animate({ width: 0 + 'px' }, 400, 'swing', function() {
            deleteChildrenById('stopMatchResults');
            deleteChildrenById('sidebar2');
            document.getElementById('container').removeChild(document.getElementById('sidebar2'));
        });

        // Animate the map_canvas back out to match the removal of the sidebar2
        $('#map_canvas').animate({ width: document.getElementById('map_canvas').clientWidth + 300 + 'px'});
    }

    // Scrolls the secondary sidebar as the page scrolls
    Sidebar.repositionSidebarSecondary = function() {
        var sidebar2;

        // If the sidebar does not exist, return
        if ((sidebar2 = document.getElementById('sidebar2')) === null)
            return;

        $(sidebar2).css({
            top: window.scroll + 'px'
        });
    }

    // Responsible for switching sidebar contexts. Takes a context from the
    // Sidebar.modes enum to switch to. All other contexts are hidden, and
    // the new context is shown.
    Sidebar.switchMode = function(newMode) {

        // If we are already there, there is nothing to do
        if (newMode === Sidebar.currMode) return;

        var oldContent, newContent;

        // Remove the secondary sidebar
        Sidebar.removeSecondary();

        // Get the previous div and hide it
        switch (Sidebar.currMode) {
            case Sidebar.modes.SUMMARY:
                oldContent = $('#stopSummaryContent');
                break;
            case Sidebar.modes.DIRECTIONS:
                oldContent = $('#directionsContent');
                break;
            case Sidebar.modes.USER:
                if (User.isLoggedIn())
                    oldContent = $('#userContentLoggedIn');
                else
                    oldContent = $('#userContent');
                break;
            case Sidebar.modes.ABOUT:
                oldContent = $('#aboutContent');
                break;
        }

        // Get the new div and show it and set the new mode
        switch (newMode) {
            case Sidebar.modes.SUMMARY:
                newContent = $('#stopSummaryContent');
                Sidebar.currMode = Sidebar.modes.SUMMARY;
                break;
            case Sidebar.modes.DIRECTIONS:
                newContent = $('#directionsContent');
                Sidebar.currMode = Sidebar.modes.DIRECTIONS;
                break;
            case Sidebar.modes.USER:
                if (!User.isLoggedIn())
                    newContent = $('#userContent');
                else
                    newContent = $('#userContentLoggedIn');
                Sidebar.currMode = Sidebar.modes.USER;
                break;
            case Sidebar.modes.ABOUT:
                newContent = $('#aboutContent');
                Sidebar.currMode = Sidebar.modes.ABOUT;
                break;
        }

        // Hide the old div, show the new one
        oldContent.css({visibility:'hidden'});
        newContent.css({visibility:'visible'});

        // If the new context is the user panel, check which panel we 
        // should render
        if ((Sidebar.currMode === Sidebar.modes.USER) && User.isLoggedIn())
            User.renderLoggedInPanel();

        // Return the new context
        return newContent;
    }

    // Responsible for retrieving the next trips for a given stop from the server
    Sidebar.getTrips = function (stopID, routeNo) {
        if (isMobile)
            deleteChildrenById('summaryResults');
        
        // POST to the server to get the next three arrival times for a bus|stop pair
        $.post('/getTrips', { stopID: stopID, routeNo: routeNo }).done(function(result) {
            var str;
            var results = [];
            var bounds = [];

            // Remove the old results
            deleteChildrenById('routeResults');

            // Remove the old bus marker
            if (Sidebar.lastBusMarker) {
                Map.deleteCustomMarkers();
                Sidebar.lastBusMarker = null;
            }

            // Parse results into js
            result = JSON.parse(result);

            // If no trips are found for route, alert and return
            if (result['Trips'][0]['Trip'] === undefined) {
                alert('No trips for route ' + result['RouteNo']);
                return;
            }

            // Extract the important information out of the verbose 
            // result object
            var trips = result['Trips'][0]['Trip'];
            var bus = {
                lat: trips[0]['Latitude'][0],
                lng: trips[0]['Longitude'][0]
            };

            // Draw a marker at the current location of the bus, and pan to that
            // location
            if (bus.lat && bus.lng) {
                var str = '';
                str += '<b><em>' + result['RouteNo'][0] + ' ' + result['RouteLabel'][0];
                str += ' (' + result['Direction'][0] + ')</em></b><br>';
                str += '<b>Destination</b>: ' + trips[0]['TripDestination'][0] + '<br>';
                str += '<b>Type</b>: ' + trips[0]['BusType'][0] + '<br>';

                // Indicate whether it is the last bus of the day or not
                if (trips[0]['LastTripOfSchedule'][0] === 'true')
                    str += '<br><b>Last Trip</b>';

                // Create the bus marker
                var marker = Map.addMarker(bus.lat, bus.lng,
                                 "Bus",
                                 str,
                                 true, null);
                Sidebar.lastBusMarker = marker;
                bounds.push(marker);
                bounds.push(Sidebar.lastRouteMarker);

                // Check whether magic google maps position variables are set
                if (bounds[0].position.hb && bounds[1].position.hb)
                    Map.zoomToMarkers(bounds);
            }

            // Format stops into html
            for (var i = 0; i < trips.length; ++i) {
                str = '';
                str += 'Trip in ' + trips[i].AdjustedScheduleTime + ' minutes';
                str += '<br>&nbsp&nbsp&nbsp&nbsp';
                str += '<i>';
                str += (trips[i].AdjustmentAge != -1) ?
                    (' (Updated ' + (trips[i].AdjustmentAge * 60 + '').slice(0, 4) + ' seconds ago)') :
                    (' (Based on scheduled time)');
                str += '</i>';
                results.push(str);
            }

            // Display stops as individual divs
            displayResults(results, 'routeResults', false, 'Next Trips');

            // Scroll down to the results
            $('body').animate({ scrollTop: $('#routeResults').position().top });
        });
    };

    // Responsible for retrieving the busses that stop at a given stop from the
    // server
    Sidebar.getSummary = function (stopID) {
      
        // POST to the server to get the summary for a stop
        $.post('/getSummary', { stopID: stopID }).done(function(result) {
            var str;
            var results = [];
            var routes;

            Sidebar.currentStop = stopID;

            // Clear results from previous stop
            deleteChildrenById('routeResults');

            // Parse results into js
            result = JSON.parse(result);

            // Extract the important information, return if 
            // an error occured (malformed object received)
            try {
                routes = result['Routes'][0]['Route'];
            } catch (e) {
                alert('Incorrect response');
                return { error: 'Incorrect response from server' };
            }

            // Get route information
            for (var i = 0; i < routes.length; ++i) {
                str = '';
                str += routes[i].RouteNo[0] + ' ';
                str += routes[i].RouteHeading[0] + ' ';
                str += '(' + routes[i].Direction + ')';
                results.push(str);
            }

            Sidebar.lastRoute = stopID;

            // display the summary in the sidebar
            displayResults(results, 'summaryResults', true,
                'Summary of <em>' + toTitleCase(result['StopDescription'][0]['_']) + '</em>',
                stopID
                );
        });
    };

    // Displays an array of strings as a series of divs under the given DOM ID
    // If clickable is true, then a function is bound to each div that retrieves
    // the appropriate trips when clicked
    function displayResults (array, id, clickable, title, stopID) {
        var results = document.getElementById(id);

        // Delete all old results
        deleteChildrenById(id);

        // Show whci stops is selected
        results.innerHTML = '<b>' + title + '</b>';

        // Draw the mouseover color change
        var handleMouseOver = function () { this.style.background = '#666'; };
        var handleMouseOut  = function () { this.style.background = '#2D2D2D'; };

        // Create a div for each stop in the array, if the user is logged in,
        // draw a fav-star (filled in if the user has already favourited the stop
        for (var i = 0, j = array.length; i < j; ++i) {
            var div = document.createElement('div');
            
            // Print the favourite star
            if (User.isLoggedIn() && clickable) {
                var route = parseInt(array[i]);
                if (User.hasFavouriteRoute(stopID, route))
                    div.innerHTML += '<i id="route-' + route + '" class="icon-star" onclick="Sidebar.removeFavRoute(' + stopID + ',' + route + ')"></i> ';
                else
                    div.innerHTML += '<i id="route-' + route + '" class="icon-star-empty" onclick="Sidebar.addFavRoute(' + stopID + ',' + route + ')"></i> ';
                div.innerHTML += '&nbsp&nbsp';
            }
            
            div.innerHTML += array[i];
            div.className = 'result';

            // Handle mouse events
            div.onmouseover = handleMouseOver;
            div.onmouseout  = handleMouseOut;
            if (clickable) bindClick(div, array[i]);

            results.appendChild(div);
        }

        // Binds the click action of each div to the appropriate bus
        // Note, this is required because of closures
        function bindClick (div, string) {
            div.onclick = function () {
                var routeNo = parseInt(string);
                Sidebar.getTrips($('#stopID').val(), routeNo);
            };
        }
    }

    // Adds a stop to the users favourites
    Sidebar.addFavRoute = function (stopID, routeID) {
        if (!User.isLoggedIn()) return;

        // Add the favourite stop to the user
        User.addFavRoute(stopID, routeID);
        Sidebar.addFavRouteButton(stopID, routeID);
    };

    // Remove a route that has been favourited from the users list
    // of favourited routes
    Sidebar.removeFavRoute = function(stopID, routeID) {
        if (!User.isLoggedIn()) return;
        
        // Remove the favourite stop from user
        User.removeFavRoute(stopID, routeID);
        Sidebar.removeFavRouteButton(stopID, routeID);
    };

    // Add a button that provides a shortcut to get trips for a 
    // bus|stop pair
    Sidebar.addFavRouteButton = function(stopID, routeID) {       
        
        // Fill in star
        $('#route-' + routeID).attr('class', 'icon-star');
        $('#route-' + routeID).attr('onClick', 'Sidebar.removeFavRoute(' + stopID + ',' + routeID + ')');

        // Add new favourite to sidebar
        var newFav = document.createElement('button');
        newFav.className = 'btn btn-custom';
        newFav.innerHTML = stopID + ':' + routeID;

        // Bind action to new button
        newFav.onclick = function () { Sidebar.getTrips(stopID, routeID); };
        document.getElementById('favRoutes').appendChild(newFav);
    };

    // Remove a shortcut button
    Sidebar.removeFavRouteButton = function(stopID, routeID) {
        
        // Unfill star
        $('#route-' + routeID).attr('class', 'icon-star-empty');
        $('#route-' + routeID).attr('onClick', 'Sidebar.addFavRoute(' + stopID + ',' + routeID + ')');

        for (var i = document.getElementById('favRoutes').children.length - 1; i >= 0; i--) {
            var button = document.getElementById('favRoutes').children[i];
            var routeAndStop = button.innerHTML.split(':');
            if (routeAndStop[0] === String(stopID) && routeAndStop[1] === String(routeID)) {

                document.getElementById('favRoutes').removeChild(button);
            }
        }
    };
 
    // Request the summary for a stop by ID, or display all matching
    // stops if user input a stop name
    Sidebar.submitStop = function(newQuery) {
        var stopID = $('#stopID').val();
        var marker;

        // Remove the secondary sidebar
        if (newQuery)
            Sidebar.removeSecondary();

        // Delete all previous results (summary and trips)
        deleteChildrenById('summaryResults');
        deleteChildrenById('routeResults');

        // Regex for checking whether the input is a four digit stop
        // code, or an attempt at a stop name
        var reg = /^[0-9]?[0-9][0-9][0-9]$/;
        var number = reg.test(stopID);

        // If the text in the StopID field is not a stop number, look for all stops
        // that match the string entered by name
        if (!number) {
            if (Map.tempMarkers !== null) 
                Map.deleteTempMarkers();

            stopID = stopID.toUpperCase();
            var matchingStops = [];
            var markers = [];

            for (var i = 0, j = Map.allStops.length; i < j; ++i) {
                if (Map.allStops[i]['stop_name'].match(stopID)) {
                    matchingStops.push(Map.allStops[i]);
                    markers.push(Map.toggleStopMarker(true, i, true));
                }
            }

            displayMatches(matchingStops);
            Map.tempMarkers = markers;
            Map.zoomToMarkers(markers);
            return;
        }

        if (document.getElementById('sidebar2') === null)
            Map.deleteTempMarkers();

        if (Sidebar.lastRoute && !Map.stopMarkersOn())
            Map.toggleStopMarker(false, Sidebar.lastRoute, false);

        for (var i = 0, j = Map.allStops.length; i < j; ++i) {
            if (stopID == Map.allStops[i]['stop_code']) {
                marker = Map.toggleStopMarker(true, i, true);
                Map.setCenter(Map.allStops[i]['stop_lat'], Map.allStops[i]['stop_lon']);
                Map.setZoom(18);
            }
        }

        Sidebar.lastRouteMarker = marker;
        Sidebar.getSummary(stopID);

        // Display matching stops
        function displayMatches (array) {

            Sidebar.createSecondary();
            var results = document.getElementById('stopMatchResults');

            deleteChildrenById('stopMatchResults');
            results.innerHTML = '<b>Stop Matches</b>';

            var handleMouseOver = function () { this.style.background = '#666'; };
            var handleMouseOut  = function () { this.style.background = '#4D4D4D'; };

            for (var i = 0, j = array.length; i < j; ++i) {
                var div = document.createElement('div');
                div.innerHTML += array[i]['stop_name'];
                div.className = 'result';

                // Handle mouse events
                div.onmouseover = handleMouseOver;
                div.onmouseout  = handleMouseOut;
                bindClick(div, array[i]);
                results.appendChild(div);
            }

            // Used to bind results divs with the appropriate
            // stop ID
            function bindClick (div, stop) {
                div.onclick = function () {
                    $('#stopID').val(stop['stop_code']);
                    Sidebar.submitStop(false);
                };
            }
        }        
    }       

    return Sidebar;
}(Sidebar || {}));


/* Handle input */

$('#submitStopByID').click(Sidebar.submitStop);
$('#submitRouteByID').click(function() {
    Sidebar.getTrips($('#stopID').val(), $('#routeNo').val());
});

/* Directions Mode */
$('#getDirections').click(function() {
    var to   = $('#directionsTo').val();
    var from = $('#directionsFrom').val();
    var request = {
        origin: from,
        destination: to,
        travelMode: google.maps.TravelMode.TRANSIT
    }

    // Get the directions 
    Map.directionsService.route(request, function (result, status) {
        switch (result['status'])
        {
            case 'ZERO_RESULTS':
                document.getElementById('directionsResults').innerHTML = '<br><em>Search terms are too ambiguous.<br>Try more specific terms.</em>';
                return;

            case 'NOT_FOUND':
                document.getElementById('directionsResults').innerHTML = '<br><em>No results found</em>';
                return;
        }

        // Display the directions using default Google Maps service
        // TODO: Add custom directions rendering with GPS data
        Map.directionsRenderer.setDirections(result);
    });
});



/* Register each input field so that 'Enter' presses within the input field
 * trigger the appropriate button handler */
registerEnterPress('#stopID', '#submitStopByID');
registerEnterPress('#routeNo', '#submitRouteByID');
registerEnterPress('#getDirections', '#directionsTo');
registerEnterPress('#directionsFrom', '#getDirections');

// Helper function for registering an enter/return press from
// an input field to firing an onlick action of a given button
function registerEnterPress(inputID, buttonID) {
    $(inputID).keyup(function (event) {
        if (event.keyCode == 13 /* (Enter) */ ) {
            $(buttonID).click();
        }
    });
}

/* Helper function that deletes all children nodes under some DOM node */
function deleteChildrenById (id) {
    var node = document.getElementById(id);

    if (node === null)
        return;

    // Delete each child in turn
    while (node.hasChildNodes())
        node.removeChild(node.lastChild);
}

// Convenience function for turing strings into title case
function toTitleCase(str)
{
    // Replace the start of each word with the uppercase variant
    // every other character should be lowercase
    return str.replace(/\w\S*/g, function (txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

// Handle scrolling elements
$(window).scroll(function () {
    Sidebar.repositionSidebarSecondary();
});
