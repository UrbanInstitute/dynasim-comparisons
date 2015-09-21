var mobile_threshold = 700;
var data;
var minutes;
var $linechart = $('#linechart');
var linechart_data_url = "data/allscenarios_new.csv";
var linechart_aspect_width = 1;
var linechart_aspect_height = 0.8;
var pymchild = null;
var equivbtn = false;

var COLORS = ["#fdbf11", "#ca5800", "#ec008b", "#ccc", "#55b748", "#12719e", "#1696d2", "#f1aaa9"];
var LABELS,
    demSelect,
    yearSelect,
    outcomeSelect;

var groups_pc = {
    ss: ["ss_1_pc", "ss_2_pc", "ss_3_pc", "ss_4_pc", "ss_5_pc", "ss_6_pc", "ss_7_pc", "ss_8_pc"],
    netinc: ["netinc_1_pc", "netinc_2_pc", "netinc_3_pc", "netinc_4_pc", "netinc_5_pc", "netinc_6_pc", "netinc_7_pc", "netinc_8_pc"],
    income: ["income_1_pc", "income_2_pc", "income_3_pc", "income_4_pc", "income_5_pc", "income_6_pc", "income_7_pc", "income_8_pc"]
};
var groups_eq = {
    ss: ["ss_1_eq", "ss_2_eq", "ss_3_eq", "ss_4_eq", "ss_5_eq", "ss_6_eq", "ss_7_eq", "ss_8_eq"],
    netinc: ["netinc_1_eq", "netinc_2_eq", "netinc_3_eq", "netinc_4_eq", "netinc_5_eq", "netinc_6_eq", "netinc_7_eq", "netinc_8_eq"],
    income: ["income_1_eq", "income_2_eq", "income_3_eq", "income_4_eq", "income_5_eq", "income_6_eq", "income_7_eq", "income_8_eq"]
};
var groupsSelect;

var names = {
    race: ["Non-Hispanic white", "African American", "Hispanic", "Other"],
    marstat: ["Married", "Divorced or separated", "Widowed", "Never married"],
    gender: ["Female", "Male"],
    education: ["No high school diploma", "High school diploma only", "Some college but no bachelor’s degree", "Bachelor’s degree"],
    age: ["62-69", "70-74", "75-79", "80-84", "85+"],
    all: ["All"]
};

var xlabel = {
    ss: "Social Security percentile",
    netinc: "Net income percentile",
    income: "Total income percentile"
}
var ymax = {
    ss: 50000,
    netinc: 100000,
    income: 140000
};

var yformat = {
    ss: d3.format("$,.1s"),
    netinc: d3.format("$,.2s"),
    income: d3.format("$,.2s")
};

var show1 = 1,
    show2 = 1,
    show3 = 1,
    show4 = 1,
    show5 = 1,
    show6 = 1,
    show7 = 1,
    show8 = 1;


function maingraph(container_width) {

    demSelect = d3.select("#dem-select").property("value");
    yearSelect = d3.select("#year-select").property("value");
    outcomeSelect = d3.select("#outcome-select").property("value");

    if (container_width == undefined || isNaN(container_width)) {
        container_width = 1170;
    }

    var margin = {
        top: 45,
        right: 40,
        bottom: 50,
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
        .domain([0, 90])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, (ymax[outcomeSelect])])
        .range([height, 0]);

    var color = d3.scale.ordinal()
        .domain(groupsSelect[outcomeSelect])
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
        return d.year == yearSelect & d.category == demSelect & d.percentile < 91;
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
        var chart = (groupsSelect[outcomeSelect]).map(function (name) {
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

    //Percentile label
    svg.append("g")
        .append("text")
        .attr("class", "percentile")
        .attr("x", x(50))
        .attr("y", height + 30)
        .attr("text-anchor", "middle")
        .text(xlabel[outcomeSelect]);

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

    console.log(show1, show2);
    //id = scenario number
    lines.append("path")
        .attr("class", "chartline")
        .attr("d", function (d) {
            return line(d.values);
        })
        .attr("id", function (d) {
            var splitter = d.name.split("_");
            return "s" + splitter[splitter.length - 2];
        })
        .attr("opacity", function (d) {
            var splitter = d.name.split("_");
            if (splitter[splitter.length - 2] == 1) {
                return show1;
            } else if (splitter[splitter.length - 2] == 2) {
                return show2;
            } else if (splitter[splitter.length - 2] == 3) {
                return show3;
            } else if (splitter[splitter.length - 2] == 4) {
                return show4;
            } else if (splitter[splitter.length - 2] == 5) {
                return show5;
            } else if (splitter[splitter.length - 2] == 6) {
                return show6;
            } else if (splitter[splitter.length - 2] == 7) {
                return show7;
            } else if (splitter[splitter.length - 2] == 8) {
                return show8;
            }
        })
        .attr("stroke", function (d) {
            return color(d.name);
        });

    //console.log(groupsSelect[outcomeSelect]);

    if (pymChild) {
        pymChild.sendHeight();
    }

}

function selections() {

    groupsSelect = groups_pc;

    $('#toggler').click(function (e) {
        var temp = d3.select('input[name="pceq"]:checked').node().id;
        if (temp == "eq") {
            groupsSelect = groups_pc;
        } else if (temp == "pc") {
            groupsSelect = groups_eq;
        }
        maingraph();
    });

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

    d3.select("div#s5").on("click", function () {
        if (show5 == 1) {
            d3.select("#s5.switch")
                .attr("class", "switch off");
            d3.selectAll("#s5.chartline")
                .attr("opacity", 0);
            show5 = 0;
        } else {
            d3.select("#s5.switch")
                .attr("class", "switch on");
            d3.selectAll("#s5.chartline")
                .attr("opacity", 1);
            show5 = 1;
        }
    });

    d3.select("div#s6").on("click", function () {
        if (show6 == 1) {
            d3.select("#s6.switch")
                .attr("class", "switch off");
            d3.selectAll("#s6.chartline")
                .attr("opacity", 0);
            show6 = 0;
        } else {
            d3.select("#s6.switch")
                .attr("class", "switch on");
            d3.selectAll("#s6.chartline")
                .attr("opacity", 1);
            show6 = 1;
        }
    });

    d3.select("div#s7").on("click", function () {
        if (show7 == 1) {
            d3.select("#s7.switch")
                .attr("class", "switch off");
            d3.selectAll("#s7.chartline")
                .attr("opacity", 0);
            show7 = 0;
        } else {
            d3.select("#s7.switch")
                .attr("class", "switch on");
            d3.selectAll("#s7.chartline")
                .attr("opacity", 1);
            show7 = 1;
        }
    });

    d3.select("div#s8").on("click", function () {
        if (show8 == 1) {
            d3.select("#s8.switch")
                .attr("class", "switch off");
            d3.selectAll("#s8.chartline")
                .attr("opacity", 0);
            show8 = 0;
        } else {
            d3.select("#s8.switch")
                .attr("class", "switch on");
            d3.selectAll("#s8.chartline")
                .attr("opacity", 1);
            show8 = 1;
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
