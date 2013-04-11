BlinkTag OC Transpo App
=======================
* *TA* Furkan

Authors
-------
* Tim Thornton
* Sehwan Lee

Description
-----------
OC Transpo App is a web application using a Node.js/MongoDB backend, and HTML/CSS/JS frontend. This application will make use of the [Developer API](http://www.octranspo1.com/developers/documentation/) provided by OC Transpo, as well as [Google Maps V3](https://developers.google.com/maps/documentation/javascript/reference/) for displaying location information. The OC Transpo stop information as well as stop statistics and other information will be stored in MongoDB, and accessible through our frontend client via the node.js server.

This application will be primarily used for displaying the real-time locations of buses using GPS data provided by the above API. Some of the key features of this application are:
* Stop schedule popularity
    * Based on user requests, shown by coloring stops with a 'heat' which represents the popularity of the stop compared to other stops
* Intuitive interface focussing on map
* Transit directions from point A to B
* Stop/User statistics stored in MongoDB
* User profiles
	* Allows saving of stops, storing favourites in MongoDB
	* Allows for synced mobile/desktop client access
		* Users may log in from mobile devices via the browser, in which case the front end will detect the mobile platform and display correct frontend

Main node.js Dependencies
-------------------------

See docs/Dependencies for more information.
* Express
* Jade
* Request
* node-xml2js
* mongoskin
* connect-mongo

Download
--------

##### UNIX:

	git clone https://github.com/CarletonU-COMP2406-W2013/BlinkTag.git
	cd BlinkTag/OCTranspoApp/
	./config.sh
	
Run
-------

##### Single launch:
	
	sudo node app.js
	
##### Persistent launch:
	
	sudo ./run.sh
	
Milestones
----------

~~**February 4**~~
*Architecture diagram and external library/program use*
* Outline use of external libraries such as OC Transpo Developer API, Google Maps V3 MongoDB, etc
* Outline interactions between technologies used
* Provide architecture diagram of web application

~~**February 11**~~
*Node.js backend implementation*
* Implement ability to communicate with OC Transpo
* Implement ability to service GET requests for documents
* Implement ability to service POST requests for functionality

~~**February 25**~~
*Database configuration and setup*
* Setup persistent store
* Import bus schedules from OC Transpo provided .csv
* Setup user statistics and stop reliability databases

~~**March 4**~~
*Framework demo (running application skeleton)*
* Provide working demo of features included in framework, such as database and OCTranspo API communication from node.js server

~~**March 11**~~
*Desktop and mobile front end design and implementation*
* User interface design and prototype
* Implement general features excluding user profiles
* Implement simplistic mobile front end

~~**March 18**~~
*Working prototype/demo*
* Provide working prototype of web application including front end from desktop/mobile clients, back end service, and database analysis

~~**March 25**~~
*User profiles*
* Implement ability to log in to app from mobile/desktop
* Store favourites and logs in database
* Implement ability to serve favourites on login
* Implement stateful application based on login status

~~**April 1**~~
*Draft documentation*

~~**April 8**~~
*Final code and documentation (April 10th)*

Example Screenshot
------------------

![Searching for Bayshore stations](/Images/ocApp.png "Searching for Bayshore stations")

[top](#blinktag-oc-transpo-app)
