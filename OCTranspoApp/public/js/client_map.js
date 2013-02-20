var Map = (function (Map) {
    
    Map.map_canvas = null;
    Map.stopMarkers = [];
    Map.customMarkers = [];

    // Initialize to a view of Ottawa in general
    Map.initialize = function () {        
        // Set canvas size
        $('#map_canvas').css({
            width: $(window).width() - 400,
            height: $(window).height()
        });

        // Set the map options
        var mapOptions = {
            zoom: 16,
            center: new google.maps.LatLng(45.415804, -75.700607),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        // Create the map
        Map.map_canvas = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

        // Draw every bus stop (temporary)
        var infowindow = new google.maps.InfoWindow({ content: 'incoming...' });
        for (var i = 0, j = stops.length; i < j; ++i) {
            Map.stopMarkers.push(new google.maps.Marker({
                position: new google.maps.LatLng(stops[i]["stop_lat"], stops[i]["stop_lon"]),
                title: stops[i]["stop_name"],
                map: null
            }));

            bindInfoWindow(Map.stopMarkers[i], Map.map_canvas, infowindow, 
                           Map.stopMarkers[i].title);
        }

        // Add the markers to a clusterer so that not every marker is
        // drawn at a time
        //Map.clusters = new MarkerClusterer(Map.map_canvas, markers);

        // Function used to bind infowindow to each marker
        function bindInfoWindow(marker, map, infowindow, html) {
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(html);
                infowindow.open(map, marker);
            });
        }
    };
    
    Map.setCenter = function (lat, lng) {
        var latlng = new google.maps.LatLng(lat, lng);
        Map.map_canvas.setCenter(latlng);
        return Map;
    };
    
    Map.setZoom = function (zoom) {
        Map.map_canvas.setZoom(zoom);
        return Map;
    };
    
    Map.addMarker = function (lat, lng, title, content, img) {
        var infowindow = new google.maps.InfoWindow({ content: 'incoming...' });
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            title: title,
            map: Map.map_canvas
        });
        Map.customMarkers.push(marker);
        google.maps.event.addListener(marker, 'click', function () {
           infowindow.setContent(content);
           infowindow.open(Map.map_canvas, marker);
        });
    };
    
    Map.toggleStopMarkers = function (show) {
        var map = null;
        
        if (show) 
            map = Map.map_canvas;

        for (var i = 0, j = Map.stopMarkers.length; i < j; ++i)
            Map.stopMarkers[i].setMap(map);
    };
    
    Map.stopMarkersOn = function () {
        return Map.stopMarkers[0].getMap();
    };

    return Map;
}(Map || {}));

google.maps.event.addDomListener(window, 'load', Map.initialize);
$(window).resize(function () {
    Map.initialize();
});
