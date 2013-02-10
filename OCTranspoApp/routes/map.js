// main handler for get requests to /
exports.home = function(req, res){
  res.render('home', { title: 'OCTranspo App' })
};

// handler for getting trips
exports.getTrips = function(req, res) {
  console.log('Incoming request for stop - ' + req.body.stopID);
  res.send('Response for stop ' + req.body.stopID);
};