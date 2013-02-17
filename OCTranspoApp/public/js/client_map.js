var map = (function () {
    var map = {};

    map.map_canvas = null;

    // Initialize to a view of Ottawa in general
    map.initialize = function () {
        // Set canvas size
        $('#map_canvas').css({
            width: $(window).width() - 300,
            height: $(window).height()
        });

        // Set the map options
        var mapOptions = {
            zoom: 15,
            center: new google.maps.LatLng(45.415804, -75.700607),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        // Create the map
        this.map_canvas = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

        // Draw every bus stop (temporary)
        var markers = [];
        var infowindow = new google.maps.InfoWindow({ content: 'incoming...' });
        for (var i = 0, j = stops.length; i < j; ++i) {
            markers.push(new google.maps.Marker({
                position: new google.maps.LatLng(stops[i]["stop_lat"], stops[i]["stop_lon"]),
                title: stops[i]["stop_name"],
                map: this.map_canvas
            }));

            google.maps.event.addListener(markers[i], 'click', function () {
                console.log('opening window');
                infowindow.setContent(this.html);
                infowindow.open(map.map_canvas, this);
            });
        }

        // Add the markers to a clusterer so that not every marker is
        // drawn at a time
        map.clusters = new MarkerClusterer(this.map_canvas, markers);
    }

    return map;
}());

google.maps.event.addDomListener(window, 'load', map.initialize);
