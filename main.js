var currentrecord = null;
var currentword = null;

function loaddata(thebutton) {
    if(currentrecord !== null) {
        currentrecord.disabled = false;
    }

    currentrecord = thebutton;
    var id = thebutton.id;
    
    thebutton.disabled = true;

    $.ajax({
    type : "POST",
    url : "http://127.0.0.1:5000/wordlist",
    dataType: 'json',
    data: JSON.stringify({"data": id}),
    contentType: 'application/json;charset=UTF-8',
    success: function(result) {
        var parent = document.querySelector(".row > .card > .card-block");

        // Clear the words
        while (parent.hasChildNodes()) {
             parent.removeChild(parent.lastChild);
        }
        for(var i = 0; i < result.length; ++i){
            var child = document.createElement("button");
            child.innerHTML = result[i];
            child.addEventListener("click", function(){loadword(this);}, false);
            child.className = "btn btn-secondary muwords";
            parent.appendChild(child);
        }
        console.log(result);
        }
    });
    
    $.ajax({
    type : "POST",
    url : "http://127.0.0.1:5000/scatterpairs",
    dataType: 'json',
    data: JSON.stringify({"data": id}),
    contentType: 'application/json;charset=UTF-8',
    success: function(result) {
            console.log(result);
            showScatterPlot(result);
        }
    });

thebutton.disabled = false;
loadGraph(thebutton);
}
// LOAD GRAPH FUNCTION GET THIS DONE
// AAA

function loadGraph(thebutton){
    var oldgraph = document.getElementsByTagName("svg")[1];
    if(oldgraph !== undefined) {
        oldgraph.parentNode.removeChild(oldgraph);
    }
    var json = "";
    var id = thebutton.id;
    $.ajax({
    type : "POST",
    url : "http://127.0.0.1:5000/wcount",
    dataType: 'json',
    data: JSON.stringify({"data": id}),
    contentType: 'application/json;charset=UTF-8',
    success: function(result) {
       console.log(result); 
    }
    });
    var margin = {top: 30, right: 30, bottom: 70, left: 40},
    width = 855 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


// set the ranges
var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

var y = d3.scale.linear().range([height, 0]);

// define the axis
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")


var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);


// add the SVG element
var svg = d3.select("#graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

	json = "pybackend/wcount" + id + ".json";
// load the data
d3.json(json, function(error, data) {

    data.forEach(function(d) {
        d.Letter = d.Letter;
        d.Freq = +d.Freq;
    });
	
  // scale the range of the data
  x.domain(data.map(function(d) { return d.Letter; }));
  y.domain([0, d3.max(data, function(d) { return d.Freq; })]);

  // add axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 5)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Word Frequency");

  // Add bar chart
  svg.selectAll("bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.Letter); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.Freq); })
      .attr("height", function(d) { return height - y(d.Freq); });

});
}

function loadword(thebutton) {
    if(currentword !== null) {
        currentword.disabled = false;
    }

    currentword = thebutton;
    thebutton.disabled = true;

    document.getElementById("adjective").innerHTML = "";
    document.getElementById("adverb").innerHTML = "";
    document.getElementById("noun").innerHTML = "";
    document.getElementById("verb").innerHTML = "";

    $.ajax({
        type : "POST",
        url : "http://127.0.0.1:5000/test",
        dataType: 'json',
        data: JSON.stringify({"data": thebutton.innerHTML}),
        contentType: 'application/json;charset=UTF-8',
        success: function(result) {
            console.log(result);
            if(result["adjective"] !== undefined && result["adjective"]["syn"] !== undefined) {
                document.getElementById("adjective").innerHTML = result["adjective"]["syn"][0];
                for(var i = 1; i < result["adjective"]["syn"].length; i++)
                    document.getElementById("adjective").innerHTML += ", " + result["adjective"]["syn"][i];
            }
            if(result["adverb"] !== undefined && result["adverb"]["syn"] !== undefined) {
                document.getElementById("adverb").innerHTML = result["adverb"]["syn"][0];
                for(var i = 1; i < result["adverb"]["syn"].length; i++) {
                    document.getElementById("adverb").innerHTML += ", " + result["adverb"]["syn"][i];
                }
            }
            if(result["noun"] !== undefined && result["noun"]["syn"] !== undefined) {
                document.getElementById("noun").innerHTML = result["noun"]["syn"][0];
                for(var i = 1; i < result["noun"]["syn"].length; i++) {
                    document.getElementById("noun").innerHTML += ", " + result["noun"]["syn"][i];
                }
            }
            if(result["verb"] !== undefined && result["verb"]["syn"] !== undefined) {
                document.getElementById("verb").innerHTML = result["verb"]["syn"][0];
                for(var i = 1; i < result["verb"]["syn"].length; i++)
                    document.getElementById("verb").innerHTML += ", " + result["verb"]["syn"][i];
            }
        }
    });
}

function showScatterPlot(data) {
    var oldgraph = document.getElementsByTagName("svg")[0];
    if(oldgraph !== undefined) {
        oldgraph.parentNode.removeChild(oldgraph);
    }
    // just to have some space around items. 
    var margins = {
        "left": 40,
        "right": 30,
        "top": 30,
        "bottom": 30
    };
    
    var width = 855;
    var height = 500;
    
    // this will be our colour scale. An Ordinal scale.
    var colors = d3.scale.category20();

    // we add the SVG component to the scatter-load div
    var svg = d3.select("#scatter-load").append("svg").attr("width", width).attr("height", height).append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

    // this sets the scale that we're using for the X axis. 
    var x = d3.scale.linear()
        .domain(d3.extent(data, function (d) {
        return d.x;
        }))
    // the range maps the domain to values from 0 to the width minus the left and right margins (used to space out the visualization)
        .range([0, width - margins.left - margins.right]);

    // this does the same as for the y axis
    var y = d3.scale.linear()
        .domain(d3.extent(data, function (d) {
        return d.x;
        }))
    // Note that height goes first due to the weird SVG coordinate system
    .range([height - margins.top - margins.bottom, 0]);

    // we add the axes SVG component. At this point, this is just a placeholder. The actual axis will be added in a bit
    svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + y.range()[0] + ")");
    svg.append("g").attr("class", "y axis");

    // this is the actual definition of our x and y axes. The orientation refers to where the labels appear - for the x axis, below or above the line, and for the y axis, left or right of the line. Tick padding refers to how much space between the tick and the label. There are other parameters too - see https://github.com/mbostock/d3/wiki/SVG-Axes for more information
    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickPadding(2);
    var yAxis = d3.svg.axis().scale(y).orient("left").tickPadding(2);

    // this is where we select the axis we created a few lines earlier. See how we select the axis item. in our svg we appended a g element with a x/y and axis class. To pull that back up, we do this svg select, then 'call' the appropriate axis object for rendering.    
    svg.selectAll("g.y.axis").call(yAxis);
    svg.selectAll("g.x.axis").call(xAxis);

    // now, we can get down to the data part, and drawing stuff. We are telling D3 that all nodes (g elements with class node) will have data attached to them. The 'key' we use (to let D3 know the uniqueness of items) will be the name. Not usually a great key, but fine for this example.
    var words = svg.selectAll("g.node").data(data, function (d) {
        return d.word;
    });

    // we 'enter' the data, making the SVG group (to contain a circle and text) with a class node. This corresponds with what we told the data it should be above.
    
    var wordGroup = words.enter().append("g").attr("class", "node")
    // this is how we set the position of the items. Translate is an incredibly useful function for rotating and positioning items 
    .attr('transform', function (d) {
        return "translate(" + x(d.x * 100) + "," + y(d.y * 100) + ")";
    });

    // we add our first graphics element! A circle! 
    wordGroup.append("circle")
        .attr("r", 5)
        .attr("class", "dot")
        .style("fill", function (d) {
            return colors(d.word);
    });

    // now we add some text, so we can see what each item is.
    wordGroup.append("text")
        .style("text-anchor", "middle")
        .attr("dy", -10)
        .text(function (d) {
            // this shouldn't be a surprising statement.
            return d.word;
    });
}
