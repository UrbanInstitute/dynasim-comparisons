var mobile_threshold = 700;
var data;
var minutes;
var $linechart = $('#linechart');
var linechart_data_url = "data/allscenarios.csv";
var linechart_aspect_width = 1;
var linechart_aspect_height = 0.8;
var pymchild = null;

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
};

var yformat = {
    ss: d3.format("$,.1s"),
    wealth: d3.format("$,.2s"),
    income: d3.format("$,.1s")
};

var show1 = 1,
    show2 = 1,
    show3 = 1,
    show4 = 1;

function maingraph(container_width) {

    demSelect = d3.select("#dem-select").property("value");
    yearSelect = d3.select("#year-select").property("value");
    outcomeSelect = d3.select("#outcome-select").property("value");

    console.log(container_width);

    if (container_width == undefined || isNaN(container_width)) {
        container_width = 1170;
    }

    var margin = {
        top: 45,
        right: 40,
        bottom: 40,
        left: 40
    };

    if (container_width < mobile_threshold) {
        linechart_aspect_height = 1.1;
        var width = container_width - margin.left - margin.right;
    } else {
        linechart_aspect_height = 0.8;
        var width = (container_width - margin.left - margin.right) / 2.3;
    }
    
    var height = Math.ceil((width * linechart_aspect_height) / linechart_aspect_width) - margin.top - margin.bottom;

    $linechart.empty();

    var x = d3.scale.linear()
        .domain([0, 100])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, (ymax[outcomeSelect])])
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
        .attr("x", -38)
        .attr("y", -25)
        .text(function (d) {
            return d.key;
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
        .data(function (d) {
            return d.values;
        })
        .enter().append("g")
        .attr("class", "group");

    //id = scenario number
    lines.append("path")
        .attr("class", "chartline")
        .attr("d", function (d) {
            return line(d.values);
        })
        .attr("id", function (d) {
            var splitter = d.name.split("_");
            return "s" + splitter[splitter.length - 1];
        })
        .attr("opacity", function (d) {
            if (d.name == "ss_1" | d.name == "wealth_1" | d.name == "income_1") {
                return show1;
            } else if (d.name == "ss_2" | d.name == "wealth_2" | d.name == "income_2") {
                return show2;
            } else if (d.name == "ss_3" | d.name == "wealth_3" | d.name == "income_3") {
                return show3;
            } else if (d.name == "ss_4" | d.name == "wealth_4" | d.name == "income_4") {
                return show4;
            }
        })
        .attr("stroke", function (d) {
            return color(d.name);
        });


    if (pymChild) {
        pymChild.sendHeight();
    }

}

function selections() {

    d3.select("div#s1").on("click", function () {
        if (show1 == 1) {
            d3.select("#s1.switch")
                .attr("class", "switch off");
            d3.selectAll("#s1.chartline")
                .attr("opacity", 0);
            show1 = 0;
        } else {
            d3.select("#s1.switch")
                .attr("class", "switch on");
            d3.selectAll("#s1.chartline")
                .attr("opacity", 1);
            show1 = 1;
        }
    });

    d3.select("div#s2").on("click", function () {
        if (show2 == 1) {
            d3.select("#s2.switch")
                .attr("class", "switch off");
            d3.selectAll("#s2.chartline")
                .attr("opacity", 0);
            show2 = 0;
        } else {
            d3.select("#s2.switch")
                .attr("class", "switch on");
            d3.selectAll("#s2.chartline")
                .attr("opacity", 1);
            show2 = 1;
        }
    });

    d3.select("div#s3").on("click", function () {
        if (show3 == 1) {
            d3.select("#s3.switch")
                .attr("class", "switch off");
            d3.selectAll("#s3.chartline")
                .attr("opacity", 0);
            show3 = 0;
        } else {
            d3.select("#s3.switch")
                .attr("class", "switch on");
            d3.selectAll("#s3.chartline")
                .attr("opacity", 1);
            show3 = 1;
        }
    });

    d3.select("div#s4").on("click", function () {
        if (show4 == 1) {
            d3.select("#s4.switch")
                .attr("class", "switch off");
            d3.selectAll("#s4.chartline")
                .attr("opacity", 0);
            show4 = 0;
        } else {
            d3.select("#s4.switch")
                .attr("class", "switch on");
            d3.selectAll("#s4.chartline")
                .attr("opacity", 1);
            show4 = 1;
        }
    });

    d3.selectAll(".selector")
        .on("change", function (d, i) {
            maingraph();
        });
}

$(window).load(function () {
    if (Modernizr.svg) {
        d3.csv(linechart_data_url, function (error, min) {
            minutes = min;
            selections();
            pymChild = new pym.Child({
                renderCallback: maingraph
            });
        });
    } else {
        pymChild = new pym.Child({});
    }
});