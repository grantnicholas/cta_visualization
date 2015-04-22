define(function(require){
    console.log('in helpers.js');

    var $ = require('jquery');
    var _  = require('underscore');



    function formatting(){
        this.margin = {top: 20, right: 20, bottom: 30, left: 40};
        this.width =  960 - this.margin.left - this.margin.right;
        this.height =  500 - this.margin.top - this.margin.bottom;
    } 


    var helper_obj = {

        tabulate : function(data, columns, domnode) {
            var adomnode = domnode!==undefined ? domnode : "body"; 
            console.log(adomnode);

            var table = d3.select(adomnode).append("table"),
                    // .attr("style", "margin-left: 250px"),
                thead = table.append("thead"),
                tbody = table.append("tbody");

            // append the header row
            thead.append("tr")
                .selectAll("th")
                .data(columns)
                .enter()
                .append("th")
                    .text(function(column) { return column; });

            // create a row for each object in the data
            var rows = tbody.selectAll("tr")
                .data(data)
                .enter()
                .append("tr");

            // create a cell in each row for each column
            var cells = rows.selectAll("td")
                .data(function(row) {
                    return columns.map(function(column) {
                        return {column: column, value: row[column]};
                    });
                })
                .enter()
                .append("td")
                .attr("style", "font-family: Courier") // sets the font style
                    .html(function(d) { return d.value; });
            
            return table;
        },

        "chart_format" : new formatting(),

        "round_to_two" : function(num) {    
            return +(Math.round(num + "e+2")  + "e-2");
        },

        "group_by_route" : function(objects){
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

            grouped_objects = _.map(grouped_objects, function(g){
                g.routes = _.map(g.routes, function(v,k){
                    return k;
                });
                return g;
            });

            return grouped_objects;
        },

        //GROUP OBJECTS BY A VARIABLE WITH A VARIABLE NUMBER OF BINS
        "group_by_bins" : function(data, binvar, numbins){

          var that = this;
          var max_binvar = d3.max(data, function(d){ return d[binvar]; });
          var groupings = _.range(0, max_binvar, max_binvar/numbins);

          var grouped_objects = {};
          _.each(groupings, function(g){
            grouped_objects[g] = [];
          });

          _.each(data, function(d){
            for(var i=0; i<groupings.length; i=i+1){
              if(d[binvar] <= groupings[i]){
                grouped_objects[groupings[i]].push(d);
                return;
              }
            }
          });

          var new_group = _.map(grouped_objects, function(v,k){
            var newobj = {};
            newobj.bucket = k;
            newobj.objs = that.group_by_route(v);
            return newobj;
          });

          console.log("grouped_objects", binvar,  grouped_objects);
          console.log("new_group", binvar, new_group);

          return new_group;

        }


    };




    return helper_obj;

});
