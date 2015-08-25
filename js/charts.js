var mobile_threshold = 600;
var data;
var $linechart = $('#linechart');
var linechart_data_url = "data/allscenarios.csv";
var linechart_aspect_width = 1;
var linechart_aspect_height;

var COLORS = ["#fdbf11", "#e66600", "#1696d2", "#a2d4ec"];
var LABELS,
    demSelect,
    yearSelect,
    outcomeSelect;


var groups = {
    ss: ["ss_1", "ss_2", "ss_3", "ss_4"],
    wealth: ["wealth_1", "wealth_2", "wealth_3", "wealth_4"],
    income: ["income_1", "income_2", "income_3", "income_4"]
};

var names = {
    race: ["White", "Black", "Hispanic", "Other"],
    marstat: ["Single", "Married", "Divorced", "Widowed"],
    gender: ["Female", "Male"],
    education: ["Some High School", "High School Graduate", "Some College", "College Graduate"],
    age: ["62-69", "70-74", "75-79", "80-84", "85+"]
};

var ymax = {
    ss: 50000,
    wealth: 2000000,
    income: 500000
}

var yformat = {
    ss: d3.format("$,.1s"),
    wealth: d3.format("$,.2s"),
    income: d3.format("$,.1s")
}

function maingraph() {
    var margin = {
        top: 45,
        right: 40,
        bottom: 40,
        left: 100
    };

    if ($linechart.width() < mobile_threshold) {
        var width = $linechart.width() - margin.left - margin.right;
    } else {
        var width = ($linechart.width() - margin.left - margin.right) / 2.5;
    }

    var height = Math.ceil((width * linechart_aspect_height) / linechart_aspect_width) - margin.top - margin.bottom;

    $linechart.empty();

    var x = d3.scale.linear()
        .domain([0, 100])
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.ordinal()
        .domain(groups[outcomeSelect])
        .range(COLORS);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(-width)
        .ticks(6)
        .tickFormat(yformat[outcomeSelect])
        .orient("left");

    //filter - later do this with dropdowns
    data = minutes.filter(function (d) {
        return d.year == yearSelect & d.category == demSelect;
    });
    LABELS = names[demSelect];

    //first nest by values of the demographic category
    var charts = d3.nest()
        .key(function (d) {
            return d.catval;
        })
        .entries(data);

    //then for each demographic value, make nested arrays for each line with each {X, Y} pair
    var data_nest = [];
    for (i = 0; i < LABELS.length; i++) {
        var chart = (groups[outcomeSelect]).map(function (name) {
            return {
                name: name,
                values: (charts[i].values).map(function (d) {
                    return {
                        percentile: d.percentile,
                        val: +d[name]
                    };
                })
            };
        });
        data_nest[i] = {
            key: LABELS[i],
            values: chart
        };
    }

    y.domain([0, (ymax[outcomeSelect])]);

    // Add an SVG for each demographic value
    var svg = d3.select("#linechart").selectAll("svg")
        .data(data_nest)
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
        .attr("class", "h4")
        .attr("x", 0)
        .attr("y", -25)
        .text(function (d) {
            return d.key;
        });

    function drawlines() {
        var line = d3.svg.line()
            .interpolate("basis")
            .x(function (d) {
                return x(d.percentile);
            })
            .y(function (d) {
                return y(d.val);
            });

        var lines = svg.selectAll(".group")
            .data(function (d) {
                return d.values;
            })
            .enter().append("g")
            .attr("class", "group");

        lines.append("path")
            .attr("class", "chartline")
            .attr("d", function (d) {
                return line(d.values);
            })
            .attr("id", function (d) {
                return d.name;
            })
            .attr("stroke", function (d) {
                return color(d.name);
            });
    }
    drawlines();

}

function drawcharts() {
    linechart_aspect_height = 0.8;
    demSelect = d3.select("#dem-select").property("value");
    yearSelect = d3.select("#year-select").property("value");
    outcomeSelect = d3.select("#outcome-select").property("value");
    maingraph();

    var onoff = d3.selectAll(".chartline");
    onoff.on("mouseover", function () {
        var moused_id = this.id;
        onoff.classed("off", function () {
            return this.id === moused_id;
        });
    })

    onoff.on("mouseout", function () {
        onoff.classed("off", false);
    })

}

d3.selectAll(".selector")
    .on("change", function (d, i) {
        drawcharts();
    });

$(window).load(function () {
    if (Modernizr.svg) { // if svg is supported, draw dynamic chart
        d3.csv(linechart_data_url, function (min) {
            minutes = min;

            drawcharts();
            window.onresize = drawcharts;
        });
    }
});