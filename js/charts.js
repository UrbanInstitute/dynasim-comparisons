var mobile_threshold = 700;
var data;
var minutes;
var $linechart = $('#linechart');
var linechart_data_url = "data/allscenarios_new.csv";
var linechart_aspect_width = 1;
var linechart_aspect_height = 0.8;
var pymchild = null;
var equivbtn = false;

var COLORS = ["#1696d2", "#d2d2d2", "#000000", "#fdbf11", "#ec008b", "#55b748", "#5c5859", "#db2b27"];
var LABELS,
    demSelect,
    yearSelect,
    outcomeSelect;

var groups_pc = {
    ss: ["ss_1_pc", "ss_2_pc", "ss_3_pc", "ss_4_pc", "ss_5_pc", "ss_6_pc", "ss_7_pc", "ss_8_pc"],
    netinc: ["netinc_1_pc","netinc_2_pc", "netinc_3_pc", "netinc_4_pc", "netinc_5_pc", "netinc_6_pc", "netinc_7_pc", "netinc_8_pc"],
    income: ["income_1_pc", "income_2_pc", "income_3_pc", "income_4_pc", "income_5_pc", "income_6_pc", "income_7_pc", "income_8_pc"]
};
var groups_eq = {
    ss: ["ss_1_eq", "ss_2_eq", "ss_3_eq", "ss_4_eq", "ss_5_eq", "ss_6_eq", "ss_7_eq", "ss_8_eq"],
    netinc: ["netinc_1_eq", "netinc_2_eq", "netinc_3_eq", "netinc_4_eq", "netinc_5_eq", "netinc_6_eq", "netinc_7_eq", "netinc_8_eq"],
    income: ["income_1_eq", "income_2_eq", "income_3_eq", "income_4_eq", "income_5_eq", "income_6_eq", "income_7_eq", "income_8_eq"]
};
var change_groups_pc = {
    ss: ["change_ss_1_pc", "change_ss_2_pc", "change_ss_3_pc", "change_ss_4_pc", "change_ss_5_pc", "change_ss_6_pc", "change_ss_7_pc", "change_ss_8_pc"],
    netinc: ["change_netinc_1_pc","change_netinc_2_pc", "change_netinc_3_pc", "change_netinc_4_pc", "change_netinc_5_pc", "change_netinc_6_pc", "change_netinc_7_pc", "change_netinc_8_pc"],
    income: ["change_income_1_pc", "change_income_2_pc", "change_income_3_pc", "change_income_4_pc", "change_income_5_pc", "change_income_6_pc", "change_income_7_pc", "change_income_8_pc"]
};
var change_groups_eq = {
    ss: ["change_ss_1_eq", "change_ss_2_eq", "change_ss_3_eq", "change_ss_4_eq", "change_ss_5_eq", "change_ss_6_eq", "change_ss_7_eq", "change_ss_8_eq"],
    netinc: ["change_netinc_1_eq", "change_netinc_2_eq", "change_netinc_3_eq", "change_netinc_4_eq", "change_netinc_5_eq", "change_netinc_6_eq", "change_netinc_7_eq", "change_netinc_8_eq"],
    income: ["change_income_1_eq", "change_income_2_eq", "change_income_3_eq", "change_income_4_eq", "change_income_5_eq", "change_income_6_eq", "change_income_7_eq", "change_income_8_eq"]
};
var groupsSelect;

var names = {
    race: ["Non-Hispanic white", "African American", "Hispanic", "Other"],
    marstat: ["Married", "Divorced or separated", "Widowed", "Never married"],
    gender: ["Female", "Male"],
    education: ["No high school diploma", "High school diploma only", "Some college but no bachelor\’s degree", "Bachelor\’s degree"],
    age: ["62\-69", "70\-74", "75\-79", "80\-84", "85+"],
    all: ["All"]
};

var titleOutcome = {
    ss: "Social Security income",
    netinc: "Net income",
    income: "Total income"
};

var titleName = {
    race: "By race-ethnicity",
    marstat: "By marital status",
    gender: "By sex",
    education: "By education level",
    age: "By age",
    all: ""
};

var xlabel = {
    ss: "Social Security percentile",
    netinc: "Net income percentile",
    income: "Total income percentile"
};

var ymax = {
    ss: 50000,
    netinc: 100000,
    income: 140000
};

var ymin = {
	ss: 0,
	netinc: 0,
	income: 0
};

var yformat = {
    ss: d3.format("$,.1s"),
    netinc: d3.format("$,.2s"),
    income: d3.format("$,.2s")
};

var show1 = 1,
    show2 = 1,
    show3 = 0,
    show4 = 0,
    show5 = 0,
    show6 = 0,
    show7 = 0,
    show8 = 0;

var temp1 = "pc";
var temp2 = "level";

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
        left: 60
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

	if (temp2 == "level") {

		var ymax = {
		    ss: 50000,
		    netinc: 100000,
		    income: 140000
		};

		var ymin = {
			ss: 0,
			netinc: 0,
			income: 0
		};
	} else if (temp2 == "change") {

		var ymax = {
		    ss: 8000,
		    netinc: 5000,
		    income: 7000
		};

		var ymin = {
			ss: -14000,
			netinc: -8000,
			income: -12000
		};
	}

    var y = d3.scale.linear()
        .domain([(ymin[outcomeSelect]), (ymax[outcomeSelect])])
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
        .tickFormat(d3.format("$,"))
        .orient("left");

    //filter - later do this with dropdowns
    data = minutes.filter(function (d) {
        return d.year == yearSelect & d.category == demSelect & d.percentile < 100;
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
                    if (d[name] == "") {
                        return {
                            percentile: d.percentile,
                            val: null
                        };
                    } else {
                        return {
                            percentile: d.percentile,
                            val: +d[name]
                        };
                    }
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

	// Chart title
	if (temp1 == "pc" && temp2 == "level") {
		document.getElementById('chart-title').innerHTML = d3.select("#year-select").property("value") + " per capita " + titleOutcome[outcomeSelect];
	} else if (temp1 == "eq" && temp2 == "level") {
		document.getElementById('chart-title').innerHTML = d3.select("#year-select").property("value") + " equivalent " + titleOutcome[outcomeSelect];
	} else if (temp1 == "pc" && temp2 == "change") {
		document.getElementById('chart-title').innerHTML = "Change in " + d3.select("#year-select").property("value") + " per capita " + titleOutcome[outcomeSelect] + " compared to current law scheduled ";
	} else if (temp1 == "eq" && temp2 == "change") {
		document.getElementById('chart-title').innerHTML = "Change in " + d3.select("#year-select").property("value") + " equivalent " + titleOutcome[outcomeSelect] + " compared to current law scheduled ";
	}

	// Chart subtitle
	document.getElementById('chart-subtitle').innerHTML = titleName[demSelect];

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
        .defined(function (d) {
            return d.val != null;
        })
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
            return "s" + splitter[splitter.length - 2];
        })
        .attr("opacity", function (d) {
            var splitter = d.name.split("_");
            if (splitter[splitter.length - 2] == 1) {
            	console.log(show1);
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

    /* if (pymChild) {
        pymChild.sendHeight();
    } */

}

function selections() {

    groupsSelect = groups_pc;

    $('#toggler1 label').click(function (e) {
        temp1 = d3.select(this).select('input').node().id;
        temp2 = d3.select('input[name="levelchange"]:checked').node().id;
        if (temp1 == "pc" && temp2 == "level") {
            groupsSelect = groups_pc;
        } else if (temp1 == "eq" && temp2 == "level") {
            groupsSelect = groups_eq;
        } else if (temp1 == "pc" && temp2 == "change") {
			groupsSelect = change_groups_pc;
		} else if (temp1 == "eq" && temp2 == "change") {
			groupsSelect = change_groups_eq;
		}
        pymChild = new pym.Child({
            renderCallback: maingraph
        });
    });

    $('#toggler2 label').click(function (e) {
        // console.log(this)
        temp1 = d3.select('input[name="pceq"]:checked').node().id;
        temp2 = d3.select(this).select('input').node().id;
        console.log(temp1, temp2)
        if (temp1 == "pc" && temp2 == "level") {
            groupsSelect = groups_pc;
        } else if (temp1 == "eq" && temp2 == "level") {
            groupsSelect = groups_eq;
        } else if (temp1 == "pc" && temp2 == "change") {
			groupsSelect = change_groups_pc;
		} else if (temp1 == "eq" && temp2 == "change") {
			groupsSelect = change_groups_eq;
		}
        pymChild = new pym.Child({
            renderCallback: maingraph
        });
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
            pymChild = new pym.Child({
                renderCallback: maingraph
            });
        });
}



var subset;
var csv;
// Export data subset
function downloadSubset() {

	console.log("Ping Subset");
	// Load data in function-level scope
    var variables = ["year", "category", "catval", "percentile"];
    var variables = variables.concat(groupsSelect[outcomeSelect]);
    console.log(variables);

	d3.csv(linechart_data_url, function(d){
        var obj = {};
        for(var i = 0; i<variables.length; i++){
            obj[variables[i]] = d[variables[i]]
        }
        return obj
    }, function (error, subset) {

	//filter - later do this with dropdowns
	subset = subset.filter(function (subset) {
	    return subset.year == yearSelect & subset.category == demSelect & subset.percentile < 100;
    });

	// select variables




	// Create a row of variable names
	var csv = d3.keys(subset[0]) + "\n";

	// Loop through rows and append as comma separated values with row escapes
	for (var i = 0, len = subset.length; i < len; i++) {
	      	row = d3.values(subset[i]);
	      	csv += row.join();
			csv += "\n";
	}

	// Create and download .csv
	var hiddenElement = document.createElement('a');
	hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
	hiddenElement.target = '_blank';
	hiddenElement.download = 'dynasim-subset.csv';
    hiddenElement.click();

	});
}

// Click event for downloading data
d3.select("#subset-downloader").on("click", downloadSubset);

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