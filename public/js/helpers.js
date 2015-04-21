define(function(require){
    console.log('in helpers.js');

    var $ = require('jquery');
    var _  = require('underscore');



    function formatting(){
        this.margin = {top: 20, right: 20, bottom: 30, left: 40};
        this.width =  960 - this.margin.left - this.margin.right;
        this.height =  500 - this.margin.top - this.margin.bottom;
        this.x = d3.scale.ordinal()
                   .rangeRoundBands([0, this.width], .1, 1);
        this.y = d3.scale.linear()
                   .range([this.height, 0]);
        this.xAxis = d3.svg.axis()
                      .scale(this.x)
                      .orient("bottom");
        this.yAxis = d3.svg.axis()
                       .scale(this.y)
                       .orient("left");
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

        "chart_format" : new formatting()


    };




    return helper_obj;

});
