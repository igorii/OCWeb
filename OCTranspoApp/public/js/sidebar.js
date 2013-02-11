$('#submitStopByID').click(function() {
  var stopID = $('#stopID').val();

  $.post('/getTrips', { stopID: stopID }).done(function(result) {
    var str = '';

    // Parse results into js
    result = JSON.parse(result);

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