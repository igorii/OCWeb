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
        map.map_canvas = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

        // Draw every bus stop (temporary)
        var markers = [];
        var infowindow = new google.maps.InfoWindow({ content: 'incoming...' });
        for (var i = 0, j = stops.length; i < j; ++i) {
            markers.push(new google.maps.Marker({
                position: new google.maps.LatLng(stops[i]["stop_lat"], stops[i]["stop_lon"]),
                title: stops[i]["stop_name"],
                map: map.map_canvas
            }));

            bindInfoWindow(markers[i], map.map_canvas, infowindow, markers[i].title);
        }

        // Add the markers to a clusterer so that not every marker is
        // drawn at a time
        map.clusters = new MarkerClusterer(map.map_canvas, markers);

        // Function used to bind infowindow to each marker
        function bindInfoWindow(marker, map, infowindow, html) {
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(html);
                infowindow.open(map, marker);
            });
        }
    }
    
    map.setCenter = function (lat, lng) {
        var latlng = new google.maps.LatLng(lat, lng);
        map.map_canvas.setCenter(latlng);
        return map;
    }
    
    map.setZoom = function (zoom) {
        map.map_canvas.setZoom(zoom);
        return map;
    }

    return map;
}());

google.maps.event.addDomListener(window, 'load', map.initialize);
