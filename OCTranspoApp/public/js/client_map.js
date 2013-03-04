var Map = (function (Map) {

    Map.map_canvas         = null;
    Map.stopMarkers        = [];
    Map.customMarkers      = [];
    Map.allStops           = null;
    Map.directionsService  = new google.maps.DirectionsService();
    Map.directionsRenderer = new google.maps.DirectionsRenderer();

    Map.initializeStopMarkers = function(stops) {
        if (Map.allStops !== null) {
            return;
        }

        Map.allStops = stops;

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
    }

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
        Map.directionsRenderer.setMap(Map.map_canvas);
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

    Map.addMarker = function (lat, lng, title, content, openNow, img) {
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

        // If true, immediately open the infowindow
        if (openNow) {
            infowindow.setContent(content);
            infowindow.open(Map.map_canvas, marker);
        }

        return marker;
    };

    Map.deleteCustomMarkers = function () {
        for (var i = 0; i < Map.customMarkers.length; ++i) {
            Map.customMarkers[i].setMap(null);
        }
        Map.customMarkers.length = 0; // Remove references to all custom markers
    };

    Map.toggleStopMarkers = function (show) {
        var map = null;

        if (show)
            map = Map.map_canvas;

        for (var i = 0, j = Map.stopMarkers.length; i < j; ++i)
            Map.stopMarkers[i].setMap(map);
    };

    Map.toggleStopMarker = function (byIndex, id, status) {
        var map = status ? Map.map_canvas : null;
        var marker;

        if (byIndex) {
            marker = Map.stopMarkers[id];
            marker.setMap(map);
            return marker;
        }

        for (var i = 0, j = Map.allStops.length; i < j; ++i) {
            if (id === Map.allStops[i]['stop_code']) {
                marker = Map.stopMarkers[i];
                marker.setMap(map);
                return marker;
            }
        }
    };

    Map.stopMarkersOn = function () {
        return !!Map.stopMarkers[0].getMap();
    };

    Map.zoomToMarkers = function (markers) {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < markers.length; ++i) {
            bounds.extend(new google.maps.LatLng(markers[i].position.lat(),
                                markers[i].position.lng()));
        }
        Map.map_canvas.fitBounds(bounds);
    };

    return Map;
}(Map || {}));

google.maps.event.addDomListener(window, 'load', Map.initialize);

$(window).resize(function () {
    Map.initialize();
});

// Make the map canvas stay in a fixed position
// This will need to be improved so that rapid scrolling does not make the
// map_canvas twitch
$(window).scroll(function () {
    $('#map_canvas').css({
        top: window.scrollY + 'px'
    });
});

$(document).ready( function() {
    $.post('/getAllStopsFromDb', {}).done( function(result) {
        Map.initializeStopMarkers(result);
    });
});
