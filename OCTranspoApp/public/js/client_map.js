var map = (function () {
    var map = {};

    map.map_canvas = null;

    // Initialize to a view of Ottawa in general
    map.initialize = function () {
        var mapOptions = {
            zoom: 15,
            center: new google.maps.LatLng(45.415804, -75.700607),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        this.map_canvas = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

        for (var i = 0, j = stops.length; i < j; ++i) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(stops[i]["stop_lat"], stops[i]["stop_lon"]),
                title: stops[i]["stop_name"],
                map: this.map_canvas
            });
        }
    }

    return map;
}());

google.maps.event.addDomListener(window, 'load', map.initialize);
