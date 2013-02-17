(function () {
    var Communicator = {};

    Communicator.getRouteSummary = function(stopNo) {
        $.post('/getTrips', { stopID: stopID }).done(function(result) {
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

        return routes;
      }
    )};

    return Communicator;
}());