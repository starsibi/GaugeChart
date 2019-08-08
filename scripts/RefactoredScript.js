var GaugeChart = (function () {
    var _options = {
        "radius": 125,
        "outerRadius": 0,
        "anglesRange": 0.5 * Math.PI,
        "thickness": 30,
        "duration": 500
    };

    var _width = 300;
    var _height = 300;
    var _colors = ["green", "#eddd02", "#900"];
    var _totalvalue = 0;

    var _initChart = function (data) {
        this.totalvalue = data.sum("value");  
        var pies = this.createPies();
        var arc = this.createArc();
        var svg = this.createSVG();
        var group = this.createGroup(svg,pies);
        var showChart = this.showChart(group,arc);
        this.createTotalValue(svg,this.totalvalue);
        this.createTotalLabel(svg);
        this.createOuterSemiCircle(svg);
        this.createLegend(data);
        this.mouseOverOnLegends();
    }

    var _createPies = function () {
        return d3.layout.pie()
            .value(function (d) { return d.value; })
            .sort(null)
            .startAngle(this.options["anglesRange"] * -1)
            .endAngle(this.options["anglesRange"]);
    }

    var _createArc = function () {
        return d3.svg.arc()
            .outerRadius(this.options["radius"])
            .innerRadius(this.options["radius"] - this.options["thickness"]);
    }

    var _createArcOver = function (options) {
        return d3.svg.arc()
            .outerRadius(options["radius"] + 20)
            .innerRadius(options["radius"] - this.options["thickness"]);
    }

    var _resetArc = function (options) {
        return d3.svg.arc()
            .outerRadius(options["radius"])
            .innerRadius(options["radius"] - options["thickness"]);
    }

    var _translation = function (x, y) {
        return `translate(${x}, ${y})`;
    }

    var _createSVG = function () {
        return d3.select("body #GaugeChart").append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("class", "half-donut")
            .append("g")
            .attr("transform", this.translation(this.width / 2, this.height))
    }

    var _createGroup = function (svg,pies) {
        return svg.selectAll(".arc")
            .data(pies(data))
            .enter().append("g")
            .attr("class", "arc");
    }

    var _showChart = function (group, arc) {
        return group.append("path")
            .attr("class", "slice")
            .attr("fill", (d, i) => this.colors[i])
            .attr("d", arc)
            .attr("id", function (d) { return d.data.key.replace(" ", "") })
            .on("mouseover", this.mouseOverOnArc)
            .on("mouseout", this.mouseOutFromArc)
            .on("click", this.mouseClickOnArc)
    }

    var _createTotalLabel = function (svg) {
       return svg.append("text")
            .text(d => "Total")
            .attr("dy", "-1rem")
            .attr("id", "status-label")
            .attr("text-anchor", "middle");
    }

    var _createTotalValue = function (svg,totalvalue) { 
        svg.append("text")
            .text(d => totalvalue)
            .attr("dy", "-3rem")
            .attr("id", "total-amount")
            .attr("text-anchor", "middle");
    }

    var _createOuterSemiCircle = function (svg) {
        var arcShadow = d3.svg.arc()
            .innerRadius(this.options["radius"] + this.options["outerRadius"])
            .outerRadius(this.options["radius"] + this.options["outerRadius"] + 20)
            .startAngle(0)
            .endAngle(Math.PI);

        var defs = svg.append("defs");
        var gradient = defs.append("linearGradient").attr({ "id": "svgGradient", "x1": "0%", "x2": "100%", "y1": "0%", "y2": "0%" });
        gradient.append("stop").attr({ "offset": "0%", "stop-color": "#000", "stop-opacity": 1 });
        gradient.append("stop").attr({ "offset": "100%", "stop-color": "#fff", "stop-opacity": 0 });
        var path = svg.append('path').attr({ "fill": "url(#svgGradient)", d: arcShadow, transform: 'rotate(-90)' })

        path.transition().duration(this.options["duration"] * 2).attrTween('d', function (d) {
            var interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
            return function (t) {
                return arcShadow(interpolate(t));
            };
        });
    }

    var _createLegend = function(datas){
        $("#Legend").empty();
        $("#Legend span").hide();
        $(datas).each(function (index, data) {
            $("#Legend span." + data.key).show();
            $("#Legend").append('<div class="legend-entry"> <span class="' + data.key.replace(" ",'') + '">' + data.key + '</span> </div>');
        });        
        $("#Legend").show();
    } 
    
    Array.prototype.sum = function (prop) {
        var total = 0;
        for ( var i = 0, _len = this.length; i < _len; i++ ) {
            total += this[i][prop];
        }
        return total;
    }    

    var _mouseOverOnArc = function (data) {
        var totalamountdiv = $("#total-amount");
        var statuslabeldiv = $("#status-label");
        $(totalamountdiv).html(data.value);
        $(statuslabeldiv).html(data["data"].key);
        var classname = data["data"].key.replace(" ", '');
        $("." + classname).addClass("hovered");
        d3.select(this).transition()
            .duration(500)
            .attr("d",GaugeChart.createArcOver(GaugeChart.options));
    }

    var _mouseOutFromArc = function (data) {
        var totalamountdiv = $("#total-amount");
        var statuslabeldiv = $("#status-label");
        $(totalamountdiv).html(GaugeChart.totalvalue);
        $(statuslabeldiv).html("Total");
        var classname = data["data"].key.replace(" ", '');
        $("." + classname).removeClass("hovered");
        d3.select(this).transition()
            .duration(500)
            .attr("d", GaugeChart.resetArc(GaugeChart.options));
    } 

    var _mouseClickOnArc = function(data){
        alert("key:"+data.data.key+" value:"+data.data.value);        
    }

    var _mouseOverOnLegends = function () {
        $(".chart-legends .legend-entry > span").hover(function () {
            var className = $(this).attr("class");
            var idName = "#" + className;

            //Trigger pie arc animation
            d3.select(idName).transition()
                .duration(500)
                .attr("d", GaugeChart.createArcOver(GaugeChart.options));

            $(this).addClass("hovered");

        }, function () {
            //Deactive piece of pie when hover is done        
            var className = $(this).attr("class").split(' ')[0];
            var idName = "#" + className;

            //Trigger pie arc animation
            d3.select(idName).transition()
                .duration(500)
                .attr("d", GaugeChart.resetArc(GaugeChart.options));

            $(this).removeClass("hovered");
        });
    }

    return {
        initChart: _initChart,
        options: _options,
        width: _width,
        height: _height,
        colors: _colors,
        totalvalue: _totalvalue,
        createPies: _createPies,
        createArc: _createArc,
        translation: _translation,
        createSVG: _createSVG,
        createGroup: _createGroup,
        showChart: _showChart,
        createTotalLabel: _createTotalLabel,
        createTotalValue: _createTotalValue,
        createOuterSemiCircle: _createOuterSemiCircle,
        createLegend: _createLegend,
        createArcOver: _createArcOver,
        mouseOverOnArc: _mouseOverOnArc,
        resetArc: _resetArc,
        mouseOutFromArc: _mouseOutFromArc,
        mouseOverOnLegends:_mouseOverOnLegends,
        mouseClickOnArc:_mouseClickOnArc
    }

})();

var data = [{
    "key": "Open",
    "value": 10
},
{
    "key": "Partial",
    "value": 80
},
{
    "key": "Past Due",
    "value": 10
}];

GaugeChart.initChart(data)