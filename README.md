BlinkTag OC Transpo App
=======================

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
	
Example Screenshot
------------------

![Searching for Bayshore stations](/Images/ocApp.png "Searching for Bayshore stations")

[top](#blinktag-oc-transpo-app)
