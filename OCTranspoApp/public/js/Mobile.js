// Mobile Initialization
$(window).ready(function () {
    var summaryButton = document.getElementById('summaryBtn');
    var directionsButton = document.getElementById('directionsBtn');
    var userButton = document.getElementById('userBtn');
    var submitStopButton = document.getElementById('submitStopByID');

    var width = screen.width / 5;

    summaryButton.style.width = width + 'px';
    directionsButton.style.width = width + 'px';
    userButton.style.width = width + 'px';


    summaryButton.onclick = function () {
        $('#summaryContent').css({visibility:'visible'});
        $('#directionsContent').css({visibility:'hidden'});
        $('#userContent').css({visibility:'hidden'});
    }

    directionsButton.onclick = function () {
        $('#summaryContent').css({visibility:'hidden'});
        $('#directionsContent').css({visibility:'visible'});
        $('#userContent').css({visibility:'hidden'});
    }

    userButton.onclick = function () {
        $('#summaryContent').css({visibility:'hidden'});
        $('#directionsContent').css({visibility:'hidden'});
        $('#userContent').css({visibility:'visible'});
    }

    submitStopButton.onclick = function () {
        Sidebar.getSummary($('#stopID').val()); 
    }
});

