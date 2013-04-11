Dependencies
============

Client
------

### [cvi_busy_lib.js](http://www.netzgesta.de/busy/)
* *Netzgestade Non-commercial Software License Agreement*
* Used solely for the loading indicator that is rendered over the Google Maps div while waiting for the stop data to be received.

### [jQuery](http://jquery.com/)
* *MIT License*
* Used for various DOM scripting.

### [Twitter Bootstrap](http://twitter.github.io/bootstrap/)
* *Apache License, Version 2.0*
* Used for UI template, and button glyphicons.

Server
------

### [Express](http://expressjs.com/)
* *MIT License*
* Used as the framework of the entire web application.

### [Jade](http://jade-lang.com/)
* *MIT License*
* Our chosen HTML templating engine. Works well with Express to render and serve Jade files.

### [Request](https://github.com/mikeal/request)
* *Apache License, Version 2.0*
* Used for easily submitting post requests to the OCTranspo RESTful API.

### [node-xml2js](https://github.com/Leonidas-from-XIV/node-xml2js)
* Used for parsing the XML responses received from requests to the OC Transpo API. The responses are often extremely verbose, so xml2js converts the XML response to a JavaScript object, from which the desrired information is extracted.

### [mongoskin](https://github.com/kissjs/node-mongoskin)
* *MIT License*
* Used for conveniently interacting with our MongoDB database. 

### [connect-mongo](https://github.com/kcbanner/connect-mongo)
* Also used for connecting to our MongoDB database.
Database
--------

### [MongoDB](http://www.mongodb.org/)
* Used for storing our persistent database. This includes all OC Transpo stop data, stop popularity, and user information such as registered users and users favourite stops.
