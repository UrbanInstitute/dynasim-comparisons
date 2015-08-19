var mobile_threshold = 600;
var data;
var $linechart = $('#linechart');
var linechart_data_url = "data/allscenarios.csv";
var linechart_aspect_width = 1;
var linechart_aspect_height = 0.8;

var COLORS = ["#1696d2", "#fdbf11", "#ec008b", "#55b748"];
var GROUPS = ["wealth_1", "wealth_2", "wealth_3", "wealth_4"];
var categories = [1, 2, 3, 4];

function bardraw() {
    var margin = {
        top: 45,
        right: 40,
        bottom: 40,
        left: 100
    };
    if ($linechart.width() < mobile_threshold) {
        margin.right = 15;
        margin.left = 20;
        var width = $linechart.width() - margin.left - margin.right;
    } else if (mobile_threshold <= $linechart.width() && $linechart.width() < 1000) {
        var width = ($linechart.width() - margin.left - margin.right) / 2;
    } else {
        var width = ($linechart.width() - margin.left - margin.right) / 3;
    }

    var height = Math.ceil((width * linechart_aspect_height) / linechart_aspect_width) - margin.top - margin.bottom;

    $linechart.empty();


    var x = d3.scale.linear()
        .domain([0, 99])
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.ordinal()
        .domain(GROUPS)
        .range(COLORS);

    var chart = d3.scale.ordinal()
        .domain(categories);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(-width)
        .orient("left")
        .ticks(8);

    //just want the main five
    data = minutes.filter(function (d) {
        return d.year == "2015" & d.category == "race" & d.percentile < 100;
    });

    var charts = d3.nest()
        .key(function (d) {
            return d.catval;
        })
        .entries(data);

    var final = color.domain().map(function (name) {
        return {
            name: name,
            values: charts.map(function (d) {
                return {
                    percentile: d.percentile,
                    category: d.catval,
                    val: +d[name]
                };
            })
        };
    });

    console.log(final);

    y.domain([0, 2000000]);

    //nest data by GROUP variable
    data_nest = d3.nest().key(function (d) {
        return d.name;
    }).entries(final);

    // Add an SVG for each character
    var svg = d3.select("#linechart").selectAll("svg")
        .data(final)
        .enter()
        .append("svg:svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //make your axes
    var gx = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "x axis")
        .call(xAxis);

    var gy = svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    gy.selectAll("g").filter(function (d) {
            return d;
        })
        .classed("minor", true);

    gy.selectAll("text")
        .attr("x", -4)
        .attr("dy", 4);

    //Title for each chart
    svg.append("g")
        .append("text")
        .attr("class", "chartTitle")
        .attr("x", 0)
        .attr("y", -25)
        .text(function (d) {
            return d.key
        });

    var line = d3.svg.line()
        .interpolate("basis")
        .x(function (d) {
            return x(d.percentile);
        })
        .y(function (d) {
            return y(d.val);
        });

    var lines = svg.selectAll(".group")
        .data(final, function (d) {
            return d.key;
        })
        .enter().append("g")
        .attr("class", "group");

    lines.append("path")
        .attr("class", "chartline")
        .attr("d", function (d) {
            return line(d.values);
        })
        .attr("id", function (d) {
            return d.key;
        })
        .attr("stroke", function (d) {
            return color(d.key);
        });

}

$(window).load(function () {
    if (Modernizr.svg) { // if svg is supported, draw dynamic chart
        d3.csv(linechart_data_url, function (min) {
            minutes = min;

            bardraw();
            window.onresize = bardraw();
        });
    }
});