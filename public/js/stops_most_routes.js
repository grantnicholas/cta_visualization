require(["jquery", "underscore", "d3", "helpers", "gmaps"], function($, _, d3, helpers, maps) {

    //Rename some variables for convenience usage
    console.log("stops_most_routes.js");
    var tabulate = helpers.tabulate;
    var margin = helpers.chart_format.margin;
    var width = helpers.chart_format.width;
    var height = helpers.chart_format.height;
    var x = helpers.chart_format.x;
    var y = helpers.chart_format.y;
    var xAxis = helpers.chart_format.xAxis;
    var yAxis = helpers.chart_format.yAxis;
    var map = maps[0];

    //FIRST GRAPH; STOPS THAT APPEAR ON THE MOST BUS ROUTES
    var svg = d3.select("#routes-per-stop-g").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("/moststops", function(error, pdata) {

      var data = Object.keys(pdata).map(function(k){
        return {
          "numroutes" : +k,
          "numstops" : +pdata[k]["count"],
          "stops" : pdata[k]["stops"]
        }
      });

      data.sort(function(a,b){return a.numroutes - b.numroutes});

      x.domain(data.map(function(d) { return d.numroutes }));
      y.domain([0, d3.max(data, function(d) { return d.numstops; })]);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .append("text")
          .attr("transform", "translate(0)")
          .attr("x", 225)
          .attr("y", 27)
          .style("text-anchor", "end")
          .text("Number of routes going through stop");

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Number of stops");

      var bar = svg.selectAll('.bar')
          .attr("class", "bar-container")
          .data(data)
          .enter().append('g')
          .attr("class", "bar-container")

      var onclickfunc = function(d,i){
        $('#query-detail-1').remove();
        var stopids = d.stops;
        console.log(stopids);
        var filters = [
        {"name" : "sid", 
        "op" : "in", 
        "val" : stopids}
        ];
        $.ajax({
          url: '/api/stop',
          data: {
            "results_per_page" : "1000",
            "q" : JSON.stringify(
              {"results_per_page" : "1000",
              "filters" : filters}
              )
          },
          dataType: "json",
          contentType: "application/json",
          success: function(data){
            var objects = data["objects"];
            var routeTable = tabulate(objects, ["sid", "id", "route", "offstreet", "onstreet", "alightings", "boardings", "latitude", "longitude"], "#routes-per-stop-t");
            map.clearMarkers();
            map.deleteMarkers();

            //GROUP OBJECTS BY ROUTE

            var grouped_objects = {};
            _.each(objects, function(obj){
                if(obj.sid in grouped_objects){
                    if("routes" in grouped_objects[obj.sid]){
                        grouped_objects[obj.sid].routes[obj.route] = true;
                    }
                    else{
                        grouped_objects[obj.sid].routes ={};
                        grouped_objects[obj.sid].routes[obj.route] = true;
                    }
                }
                else{
                    grouped_objects[obj.sid] = obj;
                    grouped_objects[obj.sid].routes = {};
                    grouped_objects[obj.sid].routes[obj.route] = true;
                }
            });

            console.log("oldgroupies", grouped_objects);
            grouped_objects = _.map(grouped_objects, function(g){
                g.routes = _.map(g.routes, function(v,k){
                    return k;
                });
                return g;
            });

            console.log("grouped_objects", grouped_objects);

            _.each(grouped_objects, function(astop){
                map.addStopMarker(astop);
            });
            
            map.showMarkers();
            routeTable.attr("id", "query-detail-1");
          }

        });

      };


      bar.append('rect')
        .attr("class", "bar")
        .style("fill-opacity", ".1" )
        .attr("width", x.rangeBand())
        .attr("height", height)
        .attr("x", function(d){ return x(d.numroutes); })
        .attr("y", function(d){ return 0; })
        .on("click", onclickfunc);


      bar.append('rect')
         .attr("class", "bar")
         .attr("width", x.rangeBand())
         .attr("height", function(d) { return height - y(d.numstops); })
         .attr("x", function(d) { return x(d.numroutes); })
         .attr("y", function(d) { return y(d.numstops); })
         .on("click", onclickfunc);
      
      bar.append('text')
         .attr("class", "text")
         .attr("x", function(d) { return x(d.numroutes)+5; })
         .attr("y", function(d) { return y(d.numstops+100); })
         .text(function(d){return d.numstops.toString()})


      //WRITE THE DATA IN THE GRAPH TO A TABLE AS WELL
      // tabulate(data, ["numroutes", "numstops"], "#routes-per-stop-t");

      //ON CLICK OF THE INPUT WE WANT TO REVERSE THE SORT OF THE GRAPH
      d3.select("#sort").on("change", change);

      function change() {

        var x0 = x.domain(data.sort(!this.checked
            ? function(a, b) { return a.numroutes - b.numroutes; } 
            : function(a, b) { return b.numstops - a.numstops; })
            .map(function(d) { return d.numroutes; }))
            .copy();

        svg.selectAll(".bar-container") 
            .sort(function(a, b) { return x0(a.numroutes) - x0(b.numroutes); });

        var transition = svg.transition().duration(750),
            delay = function(d, i) { return i * 50; };

        transition.selectAll(".bar-container") 
            .delay(delay)
            .attr("x", function(d) { return x0(d.numroutes); });

        transition.selectAll(".bar")
            .delay(delay)
            .attr("x", function(d) { return x0(d.numroutes); });

        transition.selectAll(".text") 
            .delay(delay)
            .attr("x", function(d) { return x0(d.numroutes); });

        transition.select(".x.axis")
            .call(xAxis)
          .selectAll("g")
            .delay(delay);
      }
    });

});

