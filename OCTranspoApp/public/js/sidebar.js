$('#submitStopByID').click(function() {
  var stopID = $('#stopID').val();

  $.post('/getTrips', { stopID: stopID }).done(function(result) {
    console.log(result);
    $('#target').html(result);
  });
});