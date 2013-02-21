var Sidebar = (function (Sidebar) {
    
    Sidebar.lastRoute       = null;
    Sidebar.lastBusMarker   = null;
    Sidebar.lastRouteMarker = null;
    
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
                var marker = Map.addMarker(bus.lat, bus.lng, 
                                 "BUS", 
                                 "THIS IS THE BUS", 
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
            displayResults(results, 'summaryResults', true, 'Summary of Stop');
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
    
    return Sidebar;
}(Sidebar || {}));


/* Handle input */

$('#submitStopByID').click(function() {
    var stopID = $('#stopID').val();
    var marker;
    
    if (Sidebar.lastRoute && !Map.stopMarkersOn())
        Map.toggleStopMarker(false, Sidebar.lastRoute, false);
    
    for (var i = 0, j = stops.length; i < j; ++i) {
        if (stopID === stops[i]['stop_code']) {
            marker = Map.toggleStopMarker(true, i, true);
            Map.setCenter(stops[i]['stop_lat'], stops[i]['stop_lon']);
            Map.setZoom(18);   
        }
    }
    
    Sidebar.lastRouteMarker = marker;
    Sidebar.getSummary(stopID);
});

$('#submitRouteByID').click(function() {
    Sidebar.getTrips($('#stopID').val(), $('#routeNo').val());
});

/* Register each input field so that 'Enter' presses within the input field 
 * trigger the appropriate button handler */
registerEnterPress('#stopID', '#submitStopByID');
registerEnterPress('#routeNo', '#submitRouteByID');

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

    while (node.hasChildNodes())
        node.removeChild(node.lastChild);
}