Files
=====

We have created new files on both the client and the server sides, and changed some of the given files as well.  

* [Client](#client)
    * [User.js](#userjs) 
    * [Sidebar.js](#sidebarjs) 
    * [FloatingCtrl.js](#floatingctrljs) 
    * [ClientMap.js](#clientmapjs) 
* [Views](#views)
    * [layout.jade](#layoutjade)
    * [layoutMobile.jade](#layoutmobilejade)
    * [home.jade](#homejade)
    * [homeMobile.jade](#homemobilejade)
    * [sidebar.jade](#sidebarjade)
    * [floatingCtrl.jade](#floatingctrljade)
* [Server](#server)
    * [User.js](#userjs-1) 
    * [Map.js](#mapjs) 
    * [Database.js](#databasejs) 
* [Heroku](#heroku)
* [Shell Scripts](#shell-scripts)
    * [config.sh](configsh)
    * [run.sh](#runsh)

Client
------

### JavaScript

**Path**: `../OCTranspoApp/public/js/`

### User.js

User.js defines a module that creates a User object. The User object is responsible for all user related operations, including logging in/out, favourite stop/route management, and user registration. All communication to the `users` and `sessions` collections in the database is also done through this object. In this way all user management on the client is done through a single object. A private variable maintaining the logged in status of the application is maintained in the
User object. This prevents users from manually switching state, although the would gain no information by doing so. [top](#files)

### Sidebar.js

The main functionality of our application as a Single Page App comes from the Sidebar.js file. This file is defines a module that creates a Sidebar object. The Sidebar object is responsible for all data, state, and DOM manipulations to the application sidebar (the left panel). This file includes a few categories of responsibilities:

##### Stateful functionality

A major focus of ours creating a Single Page App was creating a clean way to switch contexts. This is done through the Sidebar object, which presents four possible states: Summary, Directions, User, and About. In Summary mode, the Sidebar communicates to the server to retrieve either a stop summary (the buses that stop at a given stop), or to retrieve the next three projected arrival times for a given stop|bus pair. In Directions mode, Sidebar communicates with the Google Maps Directions
Service to retrieve directions information for two given points. The Sidebar is then responsible for displaying the textual directions, although the mapping of the directions is passed off to the ClientMap object. In User mode, the Sidebar is only responsible for either displaying a login/register panel if the user is not logged in, or a logout button if they are. All login/register/logout functionality is passed off to the User object. In About mode, the Sidebar displays our (the authors)
names and a link is presented which directs the user to the OC Transpo website.

##### Sidebar DOM manipulations

As a single Page App, there is a great deal of DOM manipulation that needs to be done in order to mimic state changes. We implemented this functionality through a series of hidden divs, where only the div corresponding to the current state is displayed. The Sidebar manages the displaying and hiding of divs when the context/mode is changed. [top](#files)

### FloatingCtrl.js

FloatingCtrl is a simple object that is created from the FloatingCtrl.js file. This object defines the behaviour for any map control buttons that appear in the control div in the bottom right of the application. Currently, the only map control provided is the ability to show/hide all available stops. [top](#files)

### ClientMap.js

ClientMap.js is a module the returns a Map object. The Map object is responsible for all manipulations to Google Maps. This includes the initialization of the map canvas, as well as all Marker and InfoBox manipulations. The Map object contains an array called `allStops`, which stores all the GPS data for every stop available. This is requested from the server on initialization. Once received, the stop markers are immediately initialized, though their map is set to null. Map
then shows and hides stops markers as necessary by setting their `map` property to the canvas, or to null. [top](#files)

Views
-----

**Path**: `../OCTranspoApp/views/`

### layout.jade

The main template for desktop users. This largely only specifies the `<head>` elements, such as scripts and stylesheets for desktop users. [top](#files)

### layoutMobile.jade

The main template for mobile users. Again, the mostly only describes what should be in the `<head>`, but for mobile users. [top](#files)

### home.jade

The file specifies the organisation of the desktop version of the web app. [top](#files)

### homeMobile.jade

This file again, specifies the organisation of the web app, but for mobile users. [top](#files)

### sidebar.jade

Most of the content comes from this file. This specifies the layout of the sidebar. A Div is created for every context the sidebar is able to take, while only the summary div is made visible. [top](#files)

### floatingCtrl.jade

This file specifies the contents of the map control div (the box in the lower right corner). [top](#files)

Server
------

**Path**: `../OCTranspoApp/routes/`

### User.js

This file defines the node module on the that is responsible for everything user-related. It handles user registration, login, logout, and checking whether the user is logged in already from the session. The module talks to the database to find out whether the user exists, login password is valid, checks session to see if user is logged in, etc. [top](#files)

### Map.js

Map.js defines the main node module which renders the jade views and serves them upon first visit to the site, as well as containing bus lookup functionality. When serving the jade view, it first determines whether the request was from a mobile device or not then renders and serves the appropriate view.  

For routes and trips, it exposes functions that contact OCTranspo through their API to get stop summaries and route times.  

Considering this is the main module, it could likely be renamed to index.js, but we were hoping to keep named files depicting their contents. [top](#files)

### Database.js

Database.js define the node module that handles everything database related, from connecting to the database to accessing/modifying the database.

##### Mongoskin

We use a wrapper around the native node-mongodb API called Mongoskin, which allows us to access the database using commands nearly identical to those available in the mongo shell such as db.createCollection(), db.xxxx.find(0), etc.  

This node module exposes functions that allows us to get all stop data (stored as JSON objects), stop popularity, user information, create a new user, get, add, and remove favourite routes for a user. [top](#files)

Heroku
------

**Path**: `../OCTranspoApp/`

### Procfile

This file, resembling a Makefile, is used to build and launch our web app using Heroku. This way we can host our web app for free on a single dyno. Going forward we will need to consider whether we want to use Heroku or another alternative. Since MongoDB Integration proved to be a pain with Heroku, we are currently hosting our web app via my own Amazon Cloud server. [top](#files)

Shell Scripts
-------------

**Path**: `../OCTranpoApp/`

### config.sh

This script will create a directory named `database`. It will then download and extract a tarball that contains our MongoDB database (stop and other information required to do an initial run of the application). Once the database has been extracted, MongoDB will try to upgrade the data in case the locally installed MongoDB daemon (mongod) is a newer version than that used to create the database.

### run.sh

This file simply reruns the node.js server if a non graceful shutdown occurred.
