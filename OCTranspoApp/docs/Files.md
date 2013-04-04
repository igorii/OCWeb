Files
=====

User.js
-------

User.js defines a module that creates a User object. The User object is responsible for all user related operations, including logging in/out, favourite stop/route management, and user registration. All communication to the `users` and `sessions` collections in the database is also done through this object. In this way all user management on the client is done through a single object. A private variable maintaining the logged in status of the application is maintained in the
User object. This prevents users from manually switching state, although the would gain no information by doing so. 

Sidebar.js
----------

The main functionality of our application as a Single Page App comes from the Sidebar.js file. This file is defines a module that creates a Sidebar object. The Sidebar object is responsible for all data, state, and DOM manipulations to the application sidebar (the left panel). This file includes a few categories of responsibilities:

### Stateful functionality

A major focus of ours creating a Single Page App was creating a clean way to switch contexts. This is done through the Sidebar object, which presents four possible states: Summary, Directions, User, and About. In Summary mode, the Sidebar communicates to the server to retrieve either a stop summary (the buses that stop at a given stop), or to retrieve the next three projected arrival times for a given stop|bus pair. In Directions mode, Sidebar communicates with the Google Maps Directions
Service to retrieve directions information for two given points. The Sidebar is then responsible for displaying the textual directions, although the mapping of the directions is passed off to the ClientMap object. In User mode, the Sidebar is only responsible for either displaying a login/register panel if the user is not logged in, or a logout button if they are. All login/register/logout functionality is passed off to the User object. In About mode, the Sidebar displays our (the authors)
names and a link is presented which directs the user to the OC Transpo website.

### Sidebar DOM manipulations

As a single Page App, there is a great deal of DOM manipulation that needs to be done in order to mimic state changes. We implemented this functionality through a series of hidden divs, where only the div corresponding to the current state is displayed. The Sidebar manages the displaying and hiding of divs when the context/mode is changed.

FloatingCtrl.js
---------------

FloatingCtrl is a simple object that is created from the FloatingCtrl.js file. This object defines the behaviour for any map control buttons that appear in the control div in the bottom right of the application. Currently, the only map control provided is the ability to show/hide all available stops.  

ClientMap.js
------------

ClientMap.js is a module the returns a Map object. The Map object is responsible for all manipulations to Google Maps. This includes the initialization of the map canvas, as well as all Marker and InfoBox manipulations. The Map object contains an array called `allStops`, which stores all the GPS data for every stop available. This is requested from the server on initialization. Once received, the stop markers are immediately initialized, though their map is set to null. Map
then shows and hides stops markers as necessary by setting their `map` property to the canvas, or to null.
