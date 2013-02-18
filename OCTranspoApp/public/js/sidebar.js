function getTrips (stopID, routeNo) {
    $.post('/getTrips', { stopID: stopID, routeNo: routeNo }).done(function(result) {
        var str;
        var results = [];

        // Parse results into js
        result = JSON.parse(result);
        var trips = result['Trips'][0]['Trip'];

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
        displayResults(results, 'routeResults', false);
    });
}

function getSummary (stopID) {
    $.post('/getSummary', { stopID: stopID }).done(function(result) {
        var str;
        var results = [];

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
        var routes = result['Routes'][0]['Route'];
        for (var i = 0; i < routes.length; ++i) {
            str = '';
            str += routes[i].RouteNo[0] + ' ';
            str += routes[i].RouteHeading[0] + ' ';
            str += '(' + routes[i].Direction + ')';
            results.push(str);
        }

        displayResults(results, 'summaryResults', true);
    });
}

$('#submitStopByID').click(function() {
    var stopID = $('#stopID').val();
    
    for (var i = 0, j = stops.length; i < j; ++i) {
        if (stopID === stops[i]['stop_code']) {
            map.setCenter(stops[i]['stop_lat'], stops[i]['stop_lon']);
            map.setZoom(18);   
        }
    }
    
    getSummary(stopID);
});

$('#submitRouteByID').click(function() {
    getTrips($('#stopID').val(), $('#routeNo').val());
});

function displayResults (array, id, clickable) {
    var results = document.getElementById(id);

    deleteChildrenById(id);
    results.innerHTML = '<b>Results</b>';
    
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
            getTrips($('#stopID').val(), routeNo);
        };
    }
}

function deleteChildrenById (id) {
    var node = document.getElementById(id);

    while (node.hasChildNodes())
        node.removeChild(node.lastChild);
}