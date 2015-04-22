define(function(require){
	console.log('in gmaps.js');

    var $ = require('jquery');
    var _  = require('underscore');



	//STRING FORMATTING
	if (!String.prototype.format) {
	  String.prototype.format = function() {
	    var args = arguments;
	    return this.replace(/{(\d+)}/g, function(match, number) { 
	      return typeof args[number] != 'undefined'
	        ? args[number]
	        : match
	      ;
	    });
	  };
	}

    var maps = [];
    function initialize() {

      //CENTER THE MAP ON CHICAGO
      var mapOptions = {
        zoom: 11,
        center: new google.maps.LatLng(41.8369, -87.6847)
      };

      var wrap_map = function(map){
	      map.markers = [];

	      // Add a marker to the map and push to the array.
	      map.addMarker = function(aobj) {
	      	console.log(aobj);
	        var location = new google.maps.LatLng(aobj.latitude,aobj.longitude);
	        var marker = new google.maps.Marker({
	          position: location,
	          map: map
	        });
	        google.maps.event.addListener(marker, 'click', function() {
	          var content = "sid: {0} onstreet: {1} offstreet: {2} route: {3}".format(aobj.sid, aobj.onstreet, aobj.offstreet, aobj.route);
	          var infowindow = new google.maps.InfoWindow();
	          infowindow.setContent(content);
	          infowindow.open(map, this);
	        });
	        this.markers.push(marker);
	      }

	      map.addStopMarker = function(stopobj) {
	      	var aobj = stopobj;

	        var location = new google.maps.LatLng(aobj.latitude,aobj.longitude);
	        var marker = new google.maps.Marker({
	          position: location,
	          map: map
	        });
	        google.maps.event.addListener(marker, 'click', function() {
	          var content = "sid: {0} onstreet: {1} offstreet: {2} ".format(aobj.sid, aobj.onstreet, aobj.offstreet);
	          var content = content + "\n routes: " + aobj.routes.toString(); 
	          console.log('content', content);

	          var infowindow = new google.maps.InfoWindow();
	          infowindow.setContent(content);
	          infowindow.open(map, this);
	        });
	        this.markers.push(marker);
	      }

	      // Sets the map on all markers in the array.
	      map.setAllMap = function(map) {
	        for (var i = 0; i < this.markers.length; i++) {
	          this.markers[i].setMap(map);
	        }
	      }

	      // Removes the markers from the map, but keeps them in the array.
	      map.clearMarkers = function() {
	        this.setAllMap(null);
	      }

	      // Shows any markers currently in the array.
	      map.showMarkers = function() {
	        this.setAllMap(map);
	      }

	      // Deletes all markers in the array by removing references to them.
	      map.deleteMarkers = function() {
	        this.clearMarkers();
	        this.markers = [];
	      }

	      return map;
  	  }
  	  var map1 = new google.maps.Map(document.getElementById('routes-per-stop-m'), mapOptions);
  	  var map2 = new google.maps.Map(document.getElementById('stops-per-route-m'), mapOptions);
  	  var map3 = new google.maps.Map(document.getElementById('aboardings-m'), mapOptions);
  	  var map4 = new google.maps.Map(document.getElementById('alightings-m'), mapOptions);

  	  map1 = wrap_map(map1);
  	  map2 = wrap_map(map2);
  	  map3 = wrap_map(map3);
  	  map4 = wrap_map(map4);

  	  maps = [map1, map2, map3, map4];
  	  console.log('maps', maps);
    }
    google.maps.event.addDomListener(window, 'load', initialize);
    initialize();

    return maps;

});
