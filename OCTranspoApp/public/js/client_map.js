var map;

// Initialize to a view of Ottawa in general
function initialize() {
    var mapOptions = {
        zoom: 13,
        center: new google.maps.LatLng(45.415804, -75.700607),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById('map_canvas'),
                              mapOptions);
}

google.maps.event.addDomListener(window, 'load', initialize);
