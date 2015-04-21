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
        "aboardsings" : "aboardings"
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
        "gmaps": {
            "exports" : "maps",
            "deps" : ["jquery"]
        }
    }
});


define(['async!http://maps.google.com/maps/api/js?sensor=false',], function(){

    require(["jquery", "underscore", "d3", "stops_most_routes", "longest_routes", "aboardings", "gmaps", "helpers"], function($, _, d3, maps, helpers) {
        console.log('requiring stuff');
        // console.log(d3);

        // require(["gmaps"], function(google) {
        //     console.log('gmaps loaded');
        //     console.log(maps);;
        // });

        // require(["helpers"], function(helpers) {
        //     console.log('helpers loaded');
        //     console.log(helpers);
        // });

    });

});

