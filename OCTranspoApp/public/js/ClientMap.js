// Check whether the user is using a desktop or mbile
// browser
var isMobile = mobilecheck();

/* 
 * Map
 * Creates an object that is responsible for managing the location data
 * for all stops, and managing ALL content that appears on the Google Maps 
 * canvas.
 */
var Map = (function (Map) {

    Map.map_canvas         = null;      // The Google Maps canvas
    Map.stopMarkers        = [];        // An array containing one marker for every stop
    Map.customMarkers      = [];        // An array of all custom markers (for busses)
    Map.tempMarkers        = null;      // A container for holding temporary markers
    Map.allStops           = null;      // An array of location data for every stop
    Map.directionsService  = new google.maps.DirectionsService();       // The Google Maps Directions service
    Map.directionsRenderer = new google.maps.DirectionsRenderer();      // The Google Maps Directions renderer
    Map.maxPopularity      = 0;         // The value of the most popular stop currently stored
    Map.minPopularity      = 0;         // The minumum popularity of a stop (probably 0)
    Map.ctrl               = null;      // The Busy object displayed while loading

    // Returns an InfoBox object
    // This is used for displaying information about markers on the
    // Google Maps canvas
    Map.getNewInfoBox = function () {
        return new InfoBox({
            content: document.getElementById('infobox'),
            disableAutoPan: false,
            maxWidth: 150,
            pixelOffset: new google.maps.Size(-140, 0),
            zIndex: null,
            boxStyle: {
                background: "url('http://google-maps-utility-library-v3.googlecode.com/svn/trunk/infobox/examples/tipbox.gif') no-repeat",
                opacity: 0.75,
                width: "280px"
            },
            closeBoxMargin: "12px 4px 2px 2px",
            closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif",
            infoBoxClearance: new google.maps.Size(1, 1)
        });
    }

    // Initializes all the stop markers based on allStops location data
    Map.initializeStopMarkers = function(stops) {
        if (Map.allStops !== null) {
            return;
        }

        // Keep a reference to the lsit of all stops
        Map.allStops = stops;
        Map.ctrl.remove();
    
        var infobox = Map.getNewInfoBox();

        // Draw every bus stop (temporary)
        var infowindow = new google.maps.InfoWindow({ content: 'incoming...' });
        for (var i = 0, j = stops.length; i < j; ++i) {
            Map.stopMarkers.push(new google.maps.Marker({
                position: new google.maps.LatLng(stops[i]["stop_lat"], stops[i]["stop_lon"]),
                title: stops[i]["stop_name"],
                map: null,
                icon: new google.maps.MarkerImage(
                    "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + 
                        Map.colorFromValue(stops[i]['popularity'], 
                            Map.maxPopularity, 
                            Map.minPopularity),
                    new google.maps.Size(21, 34),
                    new google.maps.Point(0,0),
                    new google.maps.Point(10, 34)),  
                shadow: new google.maps.MarkerImage(
                    "http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
                    new google.maps.Size(40, 37),
                    new google.maps.Point(0,0),
                    new google.maps.Point(12, 35)) 
            }));

            bindInfoWindow(Map.stopMarkers[i], Map.map_canvas, infowindow,
                           Map.stopMarkers[i].title);
        }

        // Add the markers to a clusterer so that not every marker is
        // drawn at a time
        //
        // Not used becuase it detracts from the usability, ie stops are
        // not rendered at their correct locations when zoomed out a little
        // since they are grouped. Left in for future consideration.
        //
        //Map.clusters = new MarkerClusterer(Map.map_canvas, markers);

        // Function used to bind infowindow to each marker
        function bindInfoWindow(marker, map, infowindow, html) {
            google.maps.event.addListener(marker, 'click', function() {
                var x = document.createElement('div');

                // Set the infobox information appropriately
                x.id = 'infobox';
                x.innerHTML = html;
                infobox.setContent(x);
                infobox.open(map, marker);
            });
        }
    }

    // Initialize to a view of Ottawa in general
    Map.initialize = function () {

        if (!isMobile)
            // Set canvas size
            $('#map_canvas').css({
                width: $(window).width() - 425,
                height: $(window).height()
            });
        else
            $('#map_canvas').css({
                width: 100 + '%',
                height: 130 + 'px',
                top: $('#footer').position().top - 130 + 'px'
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
        Map.directionsRenderer.setPanel(document.getElementById('directionsResults'));
    
        // Insert loading marker
        if (Map.allStops == null)
            Map.ctrl = getBusyOverlay($('#map_canvas')[0], {}, {size:48});
    };

    // Set the center of the map to given (lat, lng) 
    Map.setCenter = function (lat, lng) {
        var latlng = new google.maps.LatLng(lat, lng);
        Map.map_canvas.setCenter(latlng);
        return Map;
    };

    // Set the zoom level used by the map
    Map.setZoom = function (zoom) {
        Map.map_canvas.setZoom(zoom);
        return Map;
    };

    // Add a marker to the map, and store a reference to it in Map.customMarkers
    Map.addMarker = function (lat, lng, title, content, openNow, img) {
        var infowindow = new google.maps.InfoWindow({ content: 'incoming...' });
        var infobox = Map.getNewInfoBox();
        var colour = 'ff0000'; // red
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            title: title,
            map: Map.map_canvas,
            icon: new google.maps.MarkerImage(
                "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + colour,
                new google.maps.Size(21, 34),
                new google.maps.Point(0,0),
                new google.maps.Point(10, 34)) 
        });

        Map.customMarkers.push(marker);
        google.maps.event.addListener(marker, 'click', function() {
            var x = document.createElement('div');
            x.id = 'infobox';
            x.innerHTML = content;
            infobox.setContent(x);
            infobox.open(Map.map_canvas, marker);
                
        });

        // If true, immediately open the infowindow
        if (openNow)
            new google.maps.event.trigger(marker, 'click');

        return marker;
    };

    // Delete all custom markers to revert back to only stop markers
    Map.deleteCustomMarkers = function () {
        for (var i = 0; i < Map.customMarkers.length; ++i) {
            Map.customMarkers[i].setMap(null);
        }

        Map.customMarkers.length = 0; // Remove references to all custom markers
    };

    // Delete all temporary markers
    Map.deleteTempMarkers = function () {
        if (Map.tempMarkers === null) return;

        for (var i = 0; i < Map.tempMarkers.length; ++i) {
            Map.tempMarkers[i].setMap(null);
        }

        Map.tempMarkers.length = null; // Remove references to all custom markers
    };

    // Toggle whether all stop markers are displayed on the map canvas or not
    Map.toggleStopMarkers = function (show) {
        var map = null;

        if (show)
            map = Map.map_canvas;

        for (var i = 0, j = Map.stopMarkers.length; i < j; ++i)
            Map.stopMarkers[i].setMap(map);
    };

    // Toggles whther the marker related to a given stop is shown or hidden
    // This can be done by either finding the stop in the allStops array,
    // or by directly referening the stop by id (using allStops)
    Map.toggleStopMarker = function (byIndex, id, status) {
        var map = status ? Map.map_canvas : null;
        var marker;

        // By Index
        if (byIndex) {
            marker = Map.stopMarkers[id];
            marker.setMap(map);
            new google.maps.event.trigger( marker, 'click' );
            return marker;
        }

        // By Name
        for (var i = 0, j = Map.allStops.length; i < j; ++i) {
            if (id === Map.allStops[i]['stop_code']) {
                marker = Map.stopMarkers[i];
                marker.setMap(map);
                new google.maps.event.trigger( marker, 'click' );
                return marker;
            }
        }
    };

    // Return whether all stops markers are turned on
    // TODO: Assumes the first stop is not being shown, fix this
    Map.stopMarkersOn = function () {
        return !!Map.stopMarkers[0].getMap();
    };

    // Fit all of the given markers on the map canvas
    Map.zoomToMarkers = function (markers) {
        var bounds = new google.maps.LatLngBounds();

        for (var i = 0; i < markers.length; ++i) {
            bounds.extend(new google.maps.LatLng(markers[i].position.lat(),
                                markers[i].position.lng()));
        }

        Map.map_canvas.fitBounds(bounds);
    };

    // Converts a value|min|max triple to a RGB value representing the weight
    // of the value based on its position within the min and max
    //
    // Modified from  
    // stackoverflow.com/questions/2374959/algorithm-to-convert-any-positive-integer-to-an-rgb-value
    Map.colorFromValue = function (value, max, min) {
        var RGB = {R:0,G:0,B:0};

        if (value === max) {
            max++;
        }

        // Convert value to its individual weight
        value = value / (max - min) || 0;

        // y = mx + b
        // m = 4
        // x = value
        // y = RGB._
        if (0 <= value && value <= 1/8) {
            RGB.R = 0;
            RGB.G = 0;
            RGB.B = 4*value + .5; // .5 - 1 // b = 1/2
        } else if (1/8 < value && value <= 3/8) {
            RGB.R = 0;
            RGB.G = 4*value - .5; // 0 - 1 // b = - 1/2
            RGB.B = 0;
        } else if (3/8 < value && value <= 5/8) {
            RGB.R = 4*value - 1.5; // 0 - 1 // b = - 3/2
            RGB.G = 1;
            RGB.B = -4*value + 2.5; // 1 - 0 // b = 5/2
        } else if (5/8 < value && value <= 7/8) {
            RGB.R = 1;
            RGB.G = -4*value + 3.5; // 1 - 0 // b = 7/2
            RGB.B = 0;
        } else if (7/8 < value && value <= 1) {
            RGB.R = -4*value + 4.5; // 1 - .5 // b = 9/2
            RGB.G = 0;
            RGB.B = 0;
        } else {    // Should never happen - value > 1
            RGB.R = .5;
            RGB.G = 0;
            RGB.B = 0;
        }

        // Scale for hex conversion
        RGB.R *= 15;
        RGB.G *= 15;
        RGB.B *= 15;

        // Format as RGB
        return Math.round(RGB.R).toString(16)+''+Math.round(RGB.G).toString(16)+''+Math.round(RGB.B).toString(16);
    }; 

    return Map;
}(Map || {}));

// Load the canvas
google.maps.event.addDomListener(window, 'load', Map.initialize);

// Handle window resizes appropriately
$(window).resize(function () {

    // Set the bounds on the map
    Map.initialize();
});

// Make the map canvas stay in a fixed position
// This will need to be improved so that rapid scrolling does not make the
// map_canvas twitch
$(window).scroll(function () {
    if (isMobile)
        return;

    $('#map_canvas').css({
        top: window.scrollY + 'px'
    });
});

// Request all stops location data from the databse when the page has loaded
// Done on page load to ensure Map has been initialized
$(document).ready(function () {
        
    $.post('/getAllStopsFromDb', {}).done(function (result) {
        var routes = result.routes;       
        Map.maxPopularity = result.max[0]['value'];
        Map.initializeStopMarkers(routes);
    });
});

// Check if mobile using regex of mobile user-agent fields
function mobilecheck() {
    var check = false;

    (function(a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}
