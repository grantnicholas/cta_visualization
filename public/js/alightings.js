require(["jquery", "underscore", "d3", "helpers", "gmaps"], function($, _, d3, helpers, maps) {

    //Rename some variables for convenience usage
    console.log("alightings.js");
    var tabulate = helpers.tabulate;
    var margin = helpers.chart_format.margin;
    var width = helpers.chart_format.width;
    var height = helpers.chart_format.height;

    var x = d3.scale.ordinal()
               .rangeRoundBands([0, width], .1, 1);
    var y = d3.scale.linear()
               .range([height, 0]);
    var xAxis = d3.svg.axis()
                  .scale(x)
                  .orient("bottom");
    var yAxis = d3.svg.axis()
                   .scale(y)
                   .orient("left");

    var formatxAxis = d3.format('.2f');
    var xAxis = xAxis.tickFormat(formatxAxis);

    var map = maps[3];

    //FOURTH GRAPH; ALIGHTINGS
    var svg3 = d3.select("#alightings-g").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



    $.ajax({
      url: '/api/stop',
      data: {
        "results_per_page" : "50000"
      },
      dataType: "json",
      contentType: "application/json",
      success: ajaxcallback
    });

    function ajaxcallback(pdata){

      var data = pdata["objects"].map(function(dat){
        return dat;
      });

      data = helpers.group_by_bins(data, "alightings", 20);



      data.sort(function(a,b){return a.bucket - b.bucket});

      x.domain(data.map(function(d) { return d.bucket; }));
      y.domain([0, d3.max(data, function(d) { return d.objs.length; })]);

      svg3.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .append("text")
          .attr("transform", "translate(0)")
          .attr("x", 225)
          .attr("y", 27)
          .style("text-anchor", "end")
          .text("# of alightings: people who get off at stop");

      svg3.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Number of stops within alighting range");

      var bar = svg3.selectAll('.bar')
          .attr("class", "bar-container")
          .data(data)
          .enter().append('g')
          .attr("class", "bar-container")


      var onclickfunc = function(d,i){
            $('#query-detail-4').remove();
            var routeTable = tabulate(d.objs, ["sid", "id", "route", "offstreet", "onstreet", "alightings", 
                                                    "boardings", "latitude", "longitude"], "#alightings-t");
            routeTable.attr("id", "query-detail-4");
            map.clearMarkers();
            map.deleteMarkers();


            //GROUP OBJECTS BY ROUTE
            var grouped_objects = helpers.group_by_route(d.objs);

            if(grouped_objects.length < 500){
              _.each(grouped_objects, function(astop){
                map.addStopMarker(astop);
              });
            }
            else{
              for(var i=0; i<500; i=i+1){
                map.addStopMarker(grouped_objects[i]);
              }
              for(var i=500; i<grouped_objects.length; i=i+200){
                map.addStopMarker(grouped_objects[i]);
              }
            }

            map.showMarkers();
      }

      bar.append('rect')
        .attr("class", "bar")
        .style("fill-opacity", ".1" )
        .attr("width", x.rangeBand())
        .attr("height", height)
        .attr("x", function(d){ return x(d.bucket); })
        .attr("y", function(d){ return 0; })
        .on("click", onclickfunc);

      bar.append('rect')
         .attr("class", "bar")
         .attr("width", x.rangeBand())
         .attr("height", function(d) { return height - y(d.objs.length); })
         .attr("x", function(d) { return x(d.bucket); })
         .attr("y", function(d) { return y(d.objs.length); })
         .on("click", onclickfunc);

      bar.append('text')
         .attr("class", "text")
         .attr("x", function(d) { return x(d.bucket); })
         .attr("y", function(d) { return y(d.objs.length)-10; })
         .text(function(d){return "({0},{1}) ".format(helpers.round_to_two(d.bucket), d.objs.length); });

    }

});
