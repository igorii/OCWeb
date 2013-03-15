var isMobile = mobilecheck();

var Sidebar = (function (Sidebar) {

    Sidebar.lastRoute       = null;
    Sidebar.lastBusMarker   = null;
    Sidebar.lastRouteMarker = null;
    Sidebar.modes = {  SUMMARY:0, DIRECTIONS:1, USER:2 };
    Sidebar.currMode = Sidebar.modes.SUMMARY;

    Sidebar.createSecondary = function() {

        if (document.getElementById('sidebar2') !== null)
            return;

        var sideBar2 = document.createElement('div');
        sideBar2.id = 'sidebar2';
        $(sideBar2).css( {
            left: 390 + 'px',
            position: 'absolute',
            height: 100 + '%',
            'background-color': '#fff',
            width: 0 + 'px'
        });

        var results = document.createElement('div');
        results.id = 'stopMatchResults';
        $(results).css ({
            top: document.getElementById('sidebarContent').offsetTop +
                 document.getElementById('summaryResults').offsetTop + 'px',
            position: 'absolute'
        });
        sideBar2.appendChild(results);
        document.getElementById('container').appendChild(sideBar2);

        $('#map_canvas').animate({ width: document.getElementById('map_canvas').clientWidth - 300 + 'px'});
        $(sideBar2).animate({ width: 300 + 'px' });

    }

    Sidebar.removeSecondary = function ()
    {
        if (document.getElementById('sidebar2') === null)
            return;

        $('#sidebar2').animate({ width: 0 + 'px' }, 400, 'swing', function() {
            deleteChildrenById('stopMatchResults');
            deleteChildrenById('sidebar2');
            document.getElementById('container').removeChild(document.getElementById('sidebar2'));
        });
        $('#map_canvas').animate({ width: document.getElementById('map_canvas').clientWidth + 300 + 'px'});
    }

    Sidebar.repositionSidebarSecondary = function() {

        var sidebar2;
        if ((sidebar2 = document.getElementById('sidebar2')) === null)
            return;

        $(sidebar2).css({
            top: window.scroll + 'px'
        });
    }

    Sidebar.switchMode = function(newMode) {
        if (newMode === Sidebar.currMode) return;

        var oldContent, newContent;
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
                oldContent = $('#userContent');
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
                newContent = $('#userContent');
                Sidebar.currMode = Sidebar.modes.USER;
                break;
        }

        oldContent.css({visibility:'hidden'});
        newContent.css({visibility:'visible'});

        return newContent;
    }

    /* Responsible for retrieving the next trips for a given stop from the server */
    Sidebar.getTrips = function (stopID, routeNo) {
        $.post('/getTrips', { stopID: stopID, routeNo: routeNo }).done(function(result) {
            var str;
            var results = [];
            var bounds = [];

            deleteChildrenById('routeResults');

            if (Sidebar.lastBusMarker) {
                Map.deleteCustomMarkers();
                Sidebar.lastBusMarker = null;
            }

            // Parse results into js
            result = JSON.parse(result);
            console.log(result);

            // If no trips are found for route, alert and return
            if (result['Trips'][0]['Trip'] === undefined) {
                alert('No trips for route ' + result['RouteNo']);
                return;
            }

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

                if (trips[0]['LastTripOfSchedule'][0] === 'true')
                    str += '<br><b>Last Trip</b>';

                var marker = Map.addMarker(bus.lat, bus.lng,
                                 "HELLLOOOO",
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

    /* Responsible for retrieving the busses that stop at a given stop from the
     * server */
    Sidebar.getSummary = function (stopID) {
        $.post('/getSummary', { stopID: stopID }).done(function(result) {
            var str;
            var results = [];

            // Clear results from previous stop
            deleteChildrenById('routeResults');

            // Parse results into js
            result = JSON.parse(result);

            var routes;
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
            console.log(result);
            displayResults(results, 'summaryResults', true,
                'Summary of <em>' + toTitleCase(result['StopDescription'][0]['_']) + '</em>');
        });
    };

    /* Displays an array of strings as a series of divs under the given DOM ID
     * If clickable is true, then a function is bound to each div that retrieves
     * the appropriate trips when clicked */
    function displayResults (array, id, clickable, title) {
        var results = document.getElementById(id);

        deleteChildrenById(id);
        results.innerHTML = '<b>' + title + '</b>';

        var handleMouseOver = function () { this.style.background = '#FFFEBF'; };
        var handleMouseOut  = function () { this.style.background = '#FFF'; };

        for (var i = 0, j = array.length; i < j; ++i) {
            var div = document.createElement('div');
            div.innerHTML += array[i];
            div.className = 'result';

            // Handle mouse events
            div.onmouseover = handleMouseOver;
            div.onmouseout  = handleMouseOut;
            if (clickable) bindClick(div, array[i]);

            results.appendChild(div);
        }

        function bindClick (div, string) {
            div.onclick = function () {
                var routeNo = parseInt(string);
                Sidebar.getTrips($('#stopID').val(), routeNo);
            };
        }
    }

    Sidebar.submitStop = function(newQuery) {
        var stopID = $('#stopID').val();
        var marker;

        if (newQuery)
            Sidebar.removeSecondary();

        deleteChildrenById('summaryResults');
        deleteChildrenById('routeResults');

        var reg = /^[0-9]?[0-9][0-9][0-9]$/;
        var number = reg.test(stopID);

        // If the text in the StopID field is not a stop number, look for all stops
        // that match the string entered by name
        if (!number) {
            stopID = stopID.toUpperCase();
            var matchingStops = [];

            for (var i = 0, j = Map.allStops.length; i < j; ++i) {
                if (Map.allStops[i]['stop_name'].match(stopID)) {
                    matchingStops.push(Map.allStops[i]);
                }
            }

            displayMatches(matchingStops);
            return;
        }

        if (Sidebar.lastRoute && !Map.stopMarkersOn())
            Map.toggleStopMarker(false, Sidebar.lastRoute, false);

        for (var i = 0, j = Map.allStops.length; i < j; ++i) {
            if (stopID === Map.allStops[i]['stop_code']) {
                marker = Map.toggleStopMarker(true, i, true);
                Map.setCenter(Map.allStops[i]['stop_lat'], Map.allStops[i]['stop_lon']);
                Map.setZoom(18);
            }
        }

        Sidebar.lastRouteMarker = marker;
        Sidebar.getSummary(stopID);

        function displayMatches (array) {

            Sidebar.createSecondary();
            var results = document.getElementById('stopMatchResults');

            deleteChildrenById('stopMatchResults');
            results.innerHTML = '<b>Stop Matches</b>';

            var handleMouseOver = function () { this.style.background = '#FFFEBF'; };
            var handleMouseOut  = function () { this.style.background = '#FFF'; };

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

/*    Directions Mode */
$('#getDirections').click(function() {
    var to   = $('#directionsTo').val();
    var from = $('#directionsFrom').val();
    var request = {
        origin: from,
        destination: to,
        travelMode: google.maps.TravelMode.TRANSIT
    }
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

        Map.directionsRenderer.setDirections(result);(result);
    });
});



/* Register each input field so that 'Enter' presses within the input field
 * trigger the appropriate button handler */
registerEnterPress('#stopID', '#submitStopByID');
registerEnterPress('#routeNo', '#submitRouteByID');
registerEnterPress('#getDirections', '#directionsTo');
registerEnterPress('#directionsFrom', '#getDirections');

function registerEnterPress(inputID, buttonID) {
    $(inputID).keyup(function (event) {
        if(event.keyCode == 13) {
            $(buttonID).click();
        }
    });
}

/* Helper function that deletes all children nodes under some DOM node */
function deleteChildrenById (id) {
    var node = document.getElementById(id);

    if (node === null)
        return;

    while (node.hasChildNodes())
        node.removeChild(node.lastChild);
}

// Convenience function for turing strings into title case
function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

$(window).scroll(function () {
    console.log('Changing sidebar2 y');
    Sidebar.repositionSidebarSecondary();
});
