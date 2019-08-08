
//var option = rrdlDLUIchart974997433530["option"];
var option = {
    "radius":125,
    "outerRadius":0
}
// Data
var data = [{
            "key": "Open",
            "value": 10},
            {
            "key": "Partial",
            "value": 80},
            {
            "key": "Past Due",
            "value": 10}
            ];

var totalvalue = 100;

// Settings
var width = 300
var height = 300
var anglesRange = 0.5 * Math.PI
var radis = Math.min(width, height) / 2
var thickness = 30
  var $duration = 500;
// Utility 
//     var colors = d3.scale.category10();

var colors = ["green","#eddd02","#900"];

var pies = d3.layout.pie()
.value( function(d){return d.value;})
.sort(null)
.startAngle( anglesRange * -1)
.endAngle( anglesRange)

var arc = d3.svg.arc()
.outerRadius(option.radius)
.innerRadius(option.radius - thickness);

var arcOver = d3.svg.arc()
                .outerRadius(option.radius + 20)
                .innerRadius(option.radius - thickness);

var translation = (x, y) => `translate(${x}, ${y})`

// Feel free to change or delete any of the code you see in this editor!
var svg = d3.select("body #GaugeChart").append("svg")
.attr("width", width)
.attr("height", height)
.attr("class", "half-donut")
.append("g")
.attr("transform", translation(width /2, height))

var g = svg.selectAll(".arc")
.data(pies(data))
.enter().append("g")
.attr("class", "arc");

g.append("path")
.attr("class","slice")
.attr("fill", (d, i) => colors[i])
.attr("d", arc)
.attr("id", function (d) { return d.data.key.replace(" ","") })
.on("mouseover", mouseOverOnArc)
.on("mouseout", mouseOutFromArc)
.on("click", mouseClickOnArc)   

svg.append("text")
.text( d => totalvalue)
.attr("dy", "-3rem")
.attr("id", "total-amount")
.attr("text-anchor", "middle");

svg.append("text")
.text( d => "Total")
.attr("dy", "-1rem")
.attr("id", "status-label")
.attr("text-anchor", "middle")


function SemiCircle(svg, option) {
var arcShadow = d3.svg.arc()
.innerRadius(option.radius + option.outerRadius)
.outerRadius(option.radius + option.outerRadius + 20)
.startAngle(0)
.endAngle(Math.PI);


var defs = svg.append("defs");
var gradient = defs.append("linearGradient").attr({ "id": "svgGradient", "x1": "0%", "x2": "100%", "y1": "0%", "y2": "0%" });
gradient.append("stop").attr({ "offset": "0%", "stop-color": "#000", "stop-opacity": 1 });
gradient.append("stop").attr({ "offset": "100%", "stop-color": "#fff", "stop-opacity": 0 });
var path = svg.append('path').attr({ "fill": "url(#svgGradient)", d: arcShadow, transform: 'rotate(-90)' })

path.transition().duration($duration * 2).attrTween('d', function (d) {
    var interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
    return function (t) {
        return arcShadow(interpolate(t));
    };
});

};

function mouseOverOnArc(data){
var totalamountdiv = $("#total-amount");
var statuslabeldiv = $("#status-label");
$(totalamountdiv).html(data.value);
$(statuslabeldiv).html(data["data"].key);
var classname = data["data"].key.replace(" ",'');
 $("." +classname).addClass("hovered");
d3.select(this).transition()
    .duration(500)
    .attr("d", arcOver);
} 

function mouseOutFromArc(data){		
var totalamountdiv = $("#total-amount");
var statuslabeldiv = $("#status-label");
$(totalamountdiv).html(totalvalue);
$(statuslabeldiv).html("Total");
var classname = data["data"].key.replace(" ",'');
 $("." +classname).removeClass("hovered");
d3.select(this).transition()
    .duration(500)
    .attr("d", arc);
} 

function mouseClickOnArc (data){
debugger
}


function createLegend(datas) {
$("#Legend").empty();
$("#Legend span").hide();
$(datas).each(function (index, data) {
$("#Legend span." + data.key).show();
$("#Legend").append('<div class="legend-entry"> <span class="' + data.key.replace(" ",'') + '">' + data.key + '</span> </div>');
});

$("#chart-legend").show();
}


function initPieLegend() {
    var radius = 125;

    //Active piece of pie when hovered
    $(".chart-legends .legend-entry > span").hover(function () {        
        var className = $(this).attr("class");
        var idName = "#" + className;
    
        //Trigger pie arc animation
        d3.select(idName).transition()
            .duration(500)
            .attr("d", arcOver);

        // Trigger box around the legend
        $(this).addClass("hovered");
        
    }, function () { //Deactive piece of pie when hover is done        
        var className = $(this).attr("class").split(' ')[0];
        var idName = "#" + className;

        //Trigger pie arc animation
        d3.select(idName).transition()
        .duration(500)
        .attr("d", arc);

        //Remove box around legend
        $(this).removeClass("hovered");
               
    });
}

createLegend(data);
SemiCircle(svg,option);
initPieLegend();