require(["jquery", "underscore", "d3", "helpers", "gmaps"], function($, _, d3, helpers, maps) {

    //Rename some variables for convenience usage
    console.log("longest_routes.js");
    var tabulate = helpers.tabulate;
    var margin = helpers.chart_format.margin;
    var width = helpers.chart_format.width;
    var height = helpers.chart_format.height;
    var x = helpers.chart_format.x;
    var y = helpers.chart_format.y;
    var xAxis = helpers.chart_format.xAxis;
    var yAxis = helpers.chart_format.yAxis;
    var map = maps[1];



    //SECOND GRAPH; LONGEST ROUTES
    var svg2 = d3.select("#stops-per-route-g").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("/mostroutes", function(error, pdata) {

      var data = pdata.map(function(tup){
        return {
          "routename" : tup[0],
          "routelen" : +tup[1]
        }
      });

      data.sort(function(a,b){return a.routelen - b.routelen});

      x.domain(data.map(function(d) { return d.routename; }));
      y.domain([0, d3.max(data, function(d) { return d.routelen; })]);


      svg2.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Number of stops per route");

      var bar = svg2.selectAll('.bar')
          .attr("class", "bar-container")
          .data(data)
          .enter().append('g')
          .attr("class", "bar-container")


      var onclickfunc = function(d,i){
            $('#query-detail').remove();
            var rn = x.domain()[i];
            var filters = [
            {"name" : "route", 
            "op" : "like", 
            "val" : rn}
            ];
            $.ajax({
              url: '/api/stop',
              data: {
                "results_per_page" : "1000",
                "q" : JSON.stringify(
                  {"filters" : filters}
                )
              },
              dataType: "json",
              contentType: "application/json",
              success: function(data){
                var objects = data["objects"];
                var routeTable = tabulate(objects, ["sid", "id", "route", "offstreet", "onstreet", "alightings", 
                                                    "boardings", "latitude", "longitude"], "#stops-per-route-t");
                routeTable.attr("id", "query-detail");
                map.clearMarkers();
                map.deleteMarkers();
                
                _.each(objects, function(obj){
                    map.addMarker(obj);
                });

                map.showMarkers();
              }

            });
      }

      bar.append('rect')
        .attr("class", "bar")
        .style("fill-opacity", ".1" )
        .attr("width", x.rangeBand())
        .attr("height", 500)
        .attr("x", function(d){ return x(d.routename); })
        .attr("y", function(d){ return 0; })
        .on("click", onclickfunc);

      bar.append('rect')
         .attr("class", "bar")
         .attr("width", x.rangeBand())
         .attr("height", function(d) { return height - y(d.routelen); })
         .attr("x", function(d) { return x(d.routename); })
         .attr("y", function(d) { return y(d.routelen); })
         .on("click", onclickfunc);

      bar.append('text')
         .attr("class", "text")
         .attr("x", function(d) { return x(d.routename); })
         .attr("y", function(d) { return y(d.routelen)-10; })
         .text(function(d){return "({0},{1}) ".format(d.routename, d.routelen); });

    });

});

