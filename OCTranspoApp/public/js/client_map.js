var map;

// Initialize to a view of Ottawa in general
function initialize() {
    var mapOptions = {
        zoom: 15,
        center: new google.maps.LatLng(45.415804, -75.700607),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('map_canvas'),
                              mapOptions);

    for (var i = 0, j = stops.length; i < j; ++i) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(stops[i]["stop_lat"], stops[i]["stop_lon"]),
            title: stops[i]["stop_name"]
        });
        marker.setMap(map);
    }
}

google.maps.event.addDomListener(window, 'load', initialize);
