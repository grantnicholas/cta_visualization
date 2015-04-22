console.log('require.js app');

require.config({
    "baseUrl": "/js",
    "paths": {
        "async": 'libs/require/async',
        "jquery": "libs/jquery",
        "underscore": "libs/underscore",
        "d3" : "libs/d3.v3",
        "helpers" : "helpers",
        "stops_most_routes" : "stops_most_routes",
        "longest_routes" : "longest_routes",
        "gmaps" : "gmaps",
        "aboardings" : "aboardings",
        "alightings" : "alightings"
    },
    "shim": {
        "jquery": {
            "exports": "$"
        },
        "underscore": {
            "exports": "_"
        },
        "d3": {
            "exports": "d3",
            "deps": ["jquery", "underscore"]
        },
        "helpers": {
            "exports" : "helpers",
            "deps" : ["jquery", "underscore", "d3"]
        },
        "stops_most_routes": {
            "deps" : ["jquery", "underscore", "d3", "helpers", "gmaps"]
        },
        "longest_routes": {
            "deps" : ["jquery", "underscore", "d3", "helpers", "gmaps"]
        },
        "aboardings": {
            "deps" : ["jquery", "underscore", "d3", "helpers", "gmaps"]
        },
        "alightings": {
            "deps" : ["jquery", "underscore", "d3", "helpers", "gmaps"]
        },
        "gmaps": {
            "exports" : "maps",
            "deps" : ["jquery"]
        }
    }
});


define(['async!http://maps.google.com/maps/api/js?sensor=false',], function(){

    //DISABLE CONSOLE LOGGING FOR BETTER PERFORMANCE
    //ENABLE FOR DEBUGGING AND DEV
    //THIS IS IMPORTANT DO NOT IGNORE THIS
    
    window.console = {"log" : function(){}};

    require(["jquery", "underscore", "d3", "stops_most_routes", "longest_routes", "aboardings", "alightings", "gmaps", "helpers"], function($, _, d3, maps, helpers) {
        console.log('requiring stuff');

    });

});

