import React, { Component } from "react";
import * as d3 from "d3";
import * as cu from "./ChartUtils"
import styleJson from './../styles/root'
var parent_data = {};

export default class LineChart extends Component {
  componentDidMount() {
    this.drawChart()
  }

  componentDidUpdate() {
    this.drawChart()
  }

  drawChart() {
    const globalColorScheme = /*this.props.color*/ d3.schemeSet2;
    const margin = /*this.props.margin*/{ top: 30, right: 70, bottom: 70, left: 130 };
    const anim_dur = this.props.animation;
    if (this.props.isParent) {
      parent_data = this.props.data
    }
    var definedColors = this.props.defined_colors;
    var data = this.props.data
    const y_label = this.props.y_label;
    const x_label = this.props.x_label;
    const legendContainer = "#" + this.props.legendContainer;
    const chartContainer = "#" + /*this.props.chartContainer*/"chart-container";
    const xAxisFormat = this.props.xaxisformat;
    const yAxisFormat = this.props.yaxisformat;
    const children = this.props.children;
    var configName = this.props.configName;
    const clickToFilter = this.props.clickToFilter;
    const ifClickChildren = this.props.ifClickChildren;
    const filterSource = this.props.filterSource;
    const referenceLineValue = this.props.referenceLineValue, referenceLineColor = this.props.referenceLineColor;
    var pos = this.props.pos;
    const selectedField = this.props.selectedField, selectedValue = this.props.selectedValue;
    var width = this.props.width - margin.left - margin.right;
    var height = this.props.height - margin.top - margin.bottom;
    var secondAxis= this.props.secondAxis;
    data = data.filter(function (e) {
      return e[selectedField] == selectedValue;
    });
    var colors = data.map(function(obj) { return obj.color; });
    colors = colors.filter(function(v,i) { return colors.indexOf(v) == i; });


    // group the data: I want to draw one line per group
    var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
      .key(function (d) { return d.color; })
      .entries(data);
    // color palette
    var res = sumstat.map(function (d) { return d.key }) // list of group names
    var color = cu.get_color(res, false, this.props.defined_colors)

    var x_group = d3.map(data, function (d) { return (d.x_axis) }).keys();
    var y_group = [d3.min(data, function (d) { return d.y_axis; }), d3.max(data, function (d) { return +d.y_axis; })];

if(xAxisFormat=="time"){
  x_group = x_group.map(Number);

}
    margin.left = cu.calculateLeftMargin(y_group);
    var width = this.props.width - margin.left - margin.right;
    var height = this.props.height - margin.top - margin.bottom;

    cu.init_svg(chartContainer, legendContainer, margin, width, height)

    var xAxisRes = cu.show_x(chartContainer, height, width, x_group, x_label, margin, anim_dur, d3.easeBack, xAxisFormat, true)

    var yAxisRes = cu.show_y(chartContainer, height, y_group, y_label, margin, anim_dur, d3.easeBack);
    var x = xAxisRes[1], y = yAxisRes[1],y2;

if(secondAxis!=undefined&&secondAxis!=null){
  var data2=secondAxis.data;
  var y_group2 = [d3.min(data2, function (d) { return d.y_axis; }), d3.max(data2, function (d) { return +d.y_axis; })];

    var yAxisResSecond=cu.show_second_axis(chartContainer,height,width,y_group2,secondAxis.y_axis_label,margin,anim_dur,d3.easeBack)
    y2=yAxisResSecond[1];
  }

    //x.paddingInner(0.5).paddingOuter(0.8);
    cu.createCustomTooltip(chartContainer);

    cu.show_legend(legendContainer, res, color)

    var svg = d3.select(chartContainer).select('svg').select(".chart");


    svg.select(".meta").selectAll("*").remove()


    // Draw the line  
    if (svg.select(".shapes").selectAll("path").size() === 0) {

      svg.selectAll("*").remove()
      svg.append("g")
        .attr('class', 'meta')
      svg.append("g")
        .attr('class', 'shapes')
    }
    var re_width = this.props.width;
    var re_height = this.props.height;

    svg.select('.meta').append('rect').attr('width', width).attr('height', height).style('opacity', 0)
      .on('dblclick', function (i, n) {
        if (ifClickChildren) {
          cu.onClickChangeChart(null, re_height, re_width,legendContainer.slice(1) , null, null, false, pos, configName);

        } else {
          if (clickToFilter) {
            var redraw = new LineChart();
            redraw.props = {configName: configName, defined_colors: definedColors, data: parent_data, width: re_width, height: re_height, x_label: x_label, y_label: y_label, legendContainer: legendContainer.slice(1), clickToFilter: clickToFilter, children: children, filterSource: filterSource, referenceLineValue: referenceLineValue, referenceLineColor: referenceLineColor }
            redraw.drawChart();
          }
        }
      })
    var paths = svg.select(".shapes")
      .selectAll('path')
      .data(sumstat)

    paths.exit().remove();

    paths.enter().append("path")

    svg.select(".shapes").selectAll('path')
      .attr("class", function (d) { return "category _" + d.key.replace(/[^a-zA-Z0-9]/g, '') })
      .on("mouseover", cu.mouseover)
      .on("mouseleave", cu.mouseleave)
      .on("click", function (d) {
        var selected_field = d.key;
        if (clickToFilter) {
          var newArr = data.filter(function (e) {
            return e[filterSource] == selected_field;
          });
          var redraw = new LineChart();
          redraw.props = {configName: configName, defined_colors: definedColors, data: newArr, width: re_width, height: re_height, x_label: x_label, y_label: y_label, legendContainer: legendContainer.slice(1), clickToFilter: clickToFilter, children: children, filterSource: filterSource, referenceLineValue: referenceLineValue, referenceLineColor: referenceLineColor }
          redraw.drawChart();
        }
        else if (Object.keys(children).length != 0) {
          var childChart = children;

          if (ifClickChildren) {
            cu.onClickChangeChart(null, re_height, re_width, null, null, null, false, pos, configName);

          } else {
            cu.onClickChangeChart(childChart, re_height, re_width, legendContainer.slice(1), children.filtertarget, selected_field, true, pos, configName);

          }
        }
      })
      .transition().duration(anim_dur).ease(d3.easeBack)
      .attr("fill", "none")
      .attr("stroke", function (d) { return color(d.key) })
      .attr("stroke-width", 4/* function (d) { var count = res.length; if (count < 6) return 10; else if (count >= 15) return 4; else return 15 - count; } */)
      .attr("d", function (d) {
        return d3.line()
          .x(function (d) { return x(d.x_axis); })
          .y(function (d) { return y(+d.y_axis); })
          (d.values)
      })
      .style("opacity", 1)

      if(secondAxis!=undefined&&secondAxis!=null){
        var sumstat2 = d3.nest() // nest function allows to group the calculation per level of a factor
      .key(function (d) { return d.color; })
      .entries(secondAxis.data);
      cu.secondAxisLineChart(svg.select(".shapes"),sumstat2,anim_dur,x,y2,color);    
    }


    var circles = svg.select(".shapes").selectAll("circle").data(data)

    circles.exit().remove()

    circles.enter().append("circle");

    svg.select(".shapes").selectAll("circle")
    .on("mouseover", function (d, i, j) {
      cu.showCustomTooltip(this ,function () {
        let xAxis = xAxisFormat === 'time'?new Date(d['x_axis']).toLocaleDateString('en-US'): cu.formatNumber(d['x_axis'])
        if(colors.length === 1) return  x_label + ": " + xAxis + "\n" + y_label + ": " + cu.formatNumber(d['y_axis'])
        else return cu.formatNumber(d['color']) + "\n" + x_label + ": " + xAxis + "\n" + y_label + ": " + cu.formatNumber(d['y_axis']);
        });
      
    })
    .on("mousemove", function () {
      cu.moveCustomTooltip(this )
    })
    .on("mouseleave", function (d) { cu.hideCustomTooltip();})
      .attr("r", 8)
      .attr("cx", function (d) { return x(d.x_axis); })
      .attr("cy", function (d) { return y(+d.y_axis); })
      .style("fill", function (d) { return color(d.color); })
      .style("opacity", 0)

    // cu.tooltip(svg.select(".shapes").selectAll('circle'), function (res, that) {
    //   return cu.formatNumber(res['color']) + "\n" + x_label + ": " + cu.formatNumber(res['x_axis']) + "\n" + y_label + ": " + cu.formatNumber(res['y_axis']);
    // });


    svg.append('rect')
      .attr('height', height)
      .attr('width', width)
      .attr('fill', styleJson.root.backgroundColor)
      .transition()
      .attr('transform', 'translate(' + width + ',0)')
      .duration(2000)
      .remove()

    if (referenceLineValue != undefined) { cu.addReferenceLine(svg.select('.shapes'), x_group, referenceLineValue, referenceLineColor, x, y); }
    else { svg.select(".shapes").selectAll('.regression').remove(); }
    /* 
        var focus = svg.select('.shapes').append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("circle")
        .attr("r", 5);

    focus.append("rect")
        .attr("class", "tooltip")
        .attr("fill","white")
        .attr("stroke","black")
        .attr("stroke-width",2)
        .attr("width", "auto")
        .attr("height", 50)
        .attr("x", 10)
        .attr("y", -22)
        .attr("rx", 4)
        .attr("ry", 4);

    focus.append("text")
        .attr("class", "tooltip-date")
        .attr("x", 18)
        .attr("y", -2);

    focus.append("text")
        .attr("class", "tooltip-likes")
        .attr("x", 18)
        .attr("y", 18);

    svg.select('.meta').append("rect")
        .attr("class", "overlay")
        .attr('fill',"transparent")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);  

    function mousemove() {                                 
        var xPos = d3.mouse(this)[0];
        var domain = x.domain();
        var range = x.range();
        var rangePoints = d3.range(range[0], range[1], x.step())
        var yPos = domain[d3.bisect(rangePoints, xPos) - 1];
        var i = d3.bisect(rangePoints, xPos);
        var d0 = data[i - 1],
        d1 = data[i];
        //d = yPos - d0.date > d1.date - x0 ? d1 : d0;
        var y0 = y.invert(d3.mouse(this)[0]);         

            // i = bisectDate(data, x0, 1),                   
            // d0 = data[i - 1],                              
            // d1 = data[i],                                  
            // d = x0 - d0.date > d1.date - x0 ? d1 : d0;     
           focus.attr("transform", "translate(" + x(d0.x_axis) + "," + y(d0.y_axis) + ")");
            focus.select(".tooltip-date").text(x_label+":"+d0.x_axis);
            focus.select(".tooltip-likes").text(y_label+":"+d0.y_axis);

           }                                                      
 */

  }

  render() {
    return <div></div>
  }

}
