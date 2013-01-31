BlinkTag OC Transpo App
=======================

Authors
-------
* Tim Thornton
* Sehwan Lee
* *TA* Furkan

Description
-----------
OC App is a web application using Node.js/MongoDB backend, and HTML/CSS/JS frontend. This application will make use of the [Developer API](http://www.octranspo1.com/developers/documentation/) provided by OC Transpo, as well as [Google Maps V3](https://developers.google.com/maps/documentation/javascript/reference/). The entire OC Transpo schedule will be stored in MongoDB, and accessible through our front end client.

This application will be primarily used for displaying the real-time locations of buses using GPS data provided by the above API. Some of the key features of this application are:
* Stop schedule reliability
    * This will be done by comparing the back end schedule to bus arrival times, where stops are possibly chosen at random to prevent hogging server cycles from OC Transpo
* Intuitive interface focussing on map
* Transit directions from point A to B
	* This functionality is included in Google Maps V3 via the DirectionService object
* Stop/User statistics and logging stored in MongoDB
	* Stop interest based on user requests
* User profiles
	* Allows saving of stops and directions, storing favourites in MongoDB
	* Allows for synced mobile/desktop client access
		* Users may log in from mobile devices via the browser, in which case the front end will detect the mobile platform and display correct frontend
	* Closest stops if mobile client and correct permissions

Other features such as displaying traffic irregularities, bus types, bus fares, etc, may be included if time permits.

Milestones
----------

**February 4**
*Architecture diagram and external library/program use*
* Outline use of external libraries such as OC Transpo Developer API, Google Maps V3 MongoDB, etc
* Outline interactions between technologies used
* Provide architecture diagram of web application

**February 11**
*Node.js back end implementation*
* Implement ability to communicate with OC Transpo
* Implement ability to service GET requests for documents
* Implement ability to service POST requests for functionality

**February 25**
*Database configuration and setup*
* Setup persistent store
* Import bus schedules from OC Transpo provided .csv
* Setup user statistics and stop reliability databases

**March 4**
*Framework demo (running application skeleton)*
* Provide working demo of features included in framework, such as database and API communication from node.js server

**March 11**
*Desktop and mobile front end design and implementation*
* User interface design and prototype
* Implement general features excluding user profiles
* Implement simplistic mobile front end

**March 18**
*Working prototype/demo*
* Provide working prototype of web application including front end from desktop/mobile clients, back end service, and database analysis

**March 25**
*User profiles*
* Implement ability to log in to app from mobile/desktop
* Store favourites and logs in database
* Implement ability to serve favourites on login
* Implement stateful application based on login status

**April 1**
*Draft documentation*

**April 8**
*Final code and documentation (April 10th)*
