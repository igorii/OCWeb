Extensions
==========

Our initial thoughts of having a pseudo-real-time OC Transpo bus tracker quickly became impractical as we realized latency and server hits would inhibit a users ability to easily get the data they want out of our application. We managed to include the basic set of features that we hoped we would, which gives users a comparable set of features to current solutions, with some added features. However, there are still a few features that we would like to include, going forward with this
project.

Full Schedules
--------------

We had planned to include the ability for a user to obtain the full schedule for any given bus. This means that the user would be able to select a bus, such as the '97 Airport', and view all stop times for every stop the 97 makes in a day. This became unpractical for the scope of our project simply because of the data requirements this involves. After adding the necessary information to our MongoDB database, the space required to store the database grew from a few megabytes to 3.5
gigabytes. Going forward, it would be a great addition to add this functionality, but it would also require a clever UI design to display a schedule without cluttering the current clean feel.

Route Highlighting
------------------

After getting user feedback from a select group of people, it was brought to our attention that the ability to visually see the entire path of the bus upon selection would be helpful. This would be similar to the route maps that can be found at most bus stops. This would be done in Google Maps using polylines, which would be drawn based on an additional collection in our database. The new collection could either be set up as an array of coordinates for each stop in every route, or as a
list of stops (referencing into the existing `stops` database, which contains coordinate information) for every route.

Icon Set
--------

A fairly trivial cosmetic improvement would be to move away from using the standard Google Maps icons for both buses and stops, and begin using a custom set of icons, which more clearly depict the object to which they refer.

User Options
------------

We would like to incorporate more functionality than just favourite stops into user accounts for two reasons. First would be for making accounts more desirable, and second, to make better use of the (currently empty when logged in) User Panel.

We have a few ideas for this:
* Ability to set a home location which is used by default on load when user location cannot be found (ie not on mobile)
* Possibility of having favourite stops as well
* Ability to have favourite destinations (clicking Carleton University from favourites will get you the quickest transit directions, and include GPS data in directions

Custom Directions Rendering
---------------------------

Currently, the default Google Maps Directions Service DirectionsRenderer is being used to render directions. This does not use GPS data, which is the focus of our application. Going forward, it would be ideal to render the directions in a way that depicts the GPS data of the buses, and displays possible points of failure in the directions (buses that may not be running, or have not updated their GPS data).

