require(["jquery", "underscore", "d3", "helpers", "gmaps"], function($, _, d3, helpers, maps) {

    //Rename some variables for convenience usage
    console.log("aboardings.js");
    var tabulate = helpers.tabulate;
    var margin = helpers.chart_format.margin;
    var width = helpers.chart_format.width;
    var height = helpers.chart_format.height;
    var x = helpers.chart_format.x;
    var y = helpers.chart_format.y;
    var xAxis = helpers.chart_format.xAxis;
    var yAxis = helpers.chart_format.yAxis;
    var map = maps[2];



    //SECOND GRAPH; LONGEST ROUTES
    var svg2 = d3.select("#aboardings-g").append("svg")
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
    // d3.json("/api/stop", function(error, pdata) {

      var data = pdata["objects"].map(function(dat){
        return dat;
      });

      console.log(data);


      //GROUP OBJECTS BY BOARDINGS

      var max_boardings = d3.max(data, function(d){ return d.boardings; });
      var groupings = _.range(0, max_boardings, max_boardings/10);

      var grouped_objects = {};
      _.each(groupings, function(g){
        grouped_objects[g] = [];
      });

      _.each(data, function(d){
        for(var i=0; i<groupings.length; i=i+1){
          if(d.boardings <= groupings[i]){
            grouped_objects[groupings[i]].push(d);
            return;
          }
        }
      });

      var new_group = _.map(grouped_objects, function(v,k){
        var newobj = {};
        newobj.bucket = k;
        newobj.objs = v;
        return newobj;
      });

      console.log("grouped_objects", grouped_objects);
      console.log("new_group", new_group);

      data = new_group;



      data.sort(function(a,b){return a.bucket - b.bucket});

      x.domain(data.map(function(d) { return d.bucket; }));
      y.domain([0, d3.max(data, function(d) { return d.objs.length; })]);


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
            $('#query-detail-2').remove();
            var routeTable = tabulate(d.objs, ["sid", "id", "route", "offstreet", "onstreet", "alightings", 
                                                    "boardings", "latitude", "longitude"], "#aboardings-t");
            routeTable.attr("id", "query-detail-2");
            map.clearMarkers();
            map.deleteMarkers();
            _.each(d.objs, function(obj, i){
              if(i>500){
                if(i%100==0){
                  map.addMarker(obj);
                }
              }
              else{
                map.addMarker(obj);
              }
            });
            map.showMarkers();
      }

      bar.append('rect')
        .attr("class", "bar")
        .style("fill-opacity", ".1" )
        .attr("width", x.rangeBand())
        .attr("height", 500)
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
         .text(function(d){return "({0},{1}) ".format(d.bucket, d.objs.length); });

    }

});
