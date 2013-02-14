$('#submitStopByID').click(function() {
    var stopID = $('#stopID').val();

    $.post('/getSummary', { stopID: stopID }).done(function(result) {
        var str = '';

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
            str += routes[i].RouteNo[0] + ' ';
            str += routes[i].RouteHeading[0] + ' ';
            str += '(' + routes[i].Direction + ')';
            str += '\n';
        }

        alert(str);
    });
});

$('#submitRouteByID').click(function() {
    var stopID = $('#stopID').val();
    var routeNo = $('#routeNo').val();

    $.post('/getTrips', { stopID: stopID, routeNo: routeNo }).done(function(result) {
        var str = '';

        // Parse results into js
        result = JSON.parse(result);
        trips = result['Trips'][0]['Trip'];

        for (var i = 0; i < trips.length; ++i) {
            str += 'Trip in ' + trips[i].AdjustedScheduleTime + ' minutes';
            str += (trips[i].AdjustmentAge != -1) ?
                (' (Updated ' + (trips[i].AdjustmentAge * 60) + ' seconds ago)') :
                (' (Based on scheduled time)');
            str += '\n';
        }

        alert(str);
    });
});