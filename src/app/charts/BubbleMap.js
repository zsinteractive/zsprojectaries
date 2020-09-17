import React, { Component } from "react";
import * as d3 from "d3";
import * as cu from "./ChartUtils";
import geoJson from './../world.json'

var globalColorScheme = d3.schemeSet2;
var parent_data = {};
var parent_width;
var parent_height;


class BubbleMap extends Component {

  componentDidMount() {
    this.drawChart();
  }
  componentDidUpdate() {
    this.drawChart()
  }

  drawChart() {
    const globalColorScheme = /*this.props.color*/ d3.schemeSet2;
    const margin = /*this.props.margin*/{ top: 30, right: 30, bottom: 70, left: 130 };
    const anim_dur = this.props.animation;
    if (this.props.isParent) {
      parent_data = this.props.data
    }
    //console.log(testdata);
    var data = this.props.data
    const y_axis = this.props.y_axis
    const y_label = this.props.y_label;
    const x_label = this.props.x_label;
    const xAxisFormat = this.props.xaxisformat;
    const yAxisFormat = this.props.yaxisformat;
    const legendContainer = "#" + this.props.legendContainer;
    const chartContainer = "#" + /*this.props.chartContainer*/"chart-container";
    const selectedField = this.props.selectedField, selectedValue = this.props.selectedValue;
    var width = this.props.width - margin.left - margin.right;
    var height = this.props.height - margin.top - margin.bottom;
    const clickToFilter = this.props.clickToFilter;
    const ifClickChildren = this.props.ifClickChildren;
    var definedColors = this.props.defined_colors;
    const filterSource = this.props.filterSource;
    const referenceLineValue = this.props.referenceLineValue, referenceLineColor = this.props.referenceLineColor;
    const children = this.props.children;
    var pos = this.props.pos;
    var secondAxis = 1/* this.props.secondAxis */;
    var configName = this.props.configName;
    const colorin = "#00f", colorout = "#EC7200", colornone = "#ccc", radius = width / 2;
    var color = cu.get_color([], false, this.props.defined_colors)


    var projection = d3.geoMercator()
      .center([0, 20])                // GPS of location to zoom on
      .scale(150)                       // This is like the zoom
      .translate([width / 2, height / 2])

    cu.init_svg(chartContainer, legendContainer, margin, width, height);
    cu.hideAxes(chartContainer);
    cu.createCustomTooltip(chartContainer)

    var subgroups = d3.map(data, function (d) { return d.homecontinent; }).keys()
    var color = cu.get_color(subgroups, false, this.props.defined_colors);

    cu.show_legend(legendContainer, subgroups, color)

    var svg = d3.select(chartContainer).select('svg').select('.chart');

    // d3.select(legendContainer).select('svg').remove('*')
    // d3.select(chartContainer).select('svg').select('.chart').select(".meta").selectAll("*").remove()//Clears the SVG Meta element
 
    var re_width = this.props.width
    var re_height = this.props.height;
    svg.selectAll("*").remove()
    svg.append("g")
      .attr('class', 'meta')
    svg.append("g")
      .attr('class', 'shapes')
    d3.select(chartContainer).select('svg').select('.trans').attr("transform", "translate(0,0)");
    svg = svg.select('.meta')

    ready("", geoJson, data)
    function ready(error, dataGeo, data) {

      // Create a color scale
      var allContinent = d3.map(data, function (d) { return (d.homecontinent) }).keys()
     
      // Add a scale for bubble size
      var valueExtent = d3.extent(data, function (d) { return +d.n; })
      var size = d3.scaleSqrt()
        .domain(valueExtent)  // What's in the data
        .range([5, 20])  // Size in pixel

      // Draw the map
      svg.append("g")
        .selectAll("path")
        .data(dataGeo.features)
        .enter()
        .append("path")
        .attr("fill", "#b8b8b8")
        .attr("d", d3.geoPath()
          .projection(projection)
        )
        .style("stroke", "none")
        .style("opacity", .3)

      // Add circles:
      svg
        .selectAll("myCircles")
        .data(data.sort(function (a, b) { return +b.n - +a.n }).filter(function (d, i) { return i < 1000 }))
        .enter()
        .append("circle")
        .attr("cx", function (d) { return projection([+d.homelon, +d.homelat])[0] })
        .attr("cy", function (d) { return projection([+d.homelon, +d.homelat])[1] })
        .attr("r", function (d) { return size(+d.n) })
        .on("mouseover", function (d, i, j) {
          cu.showCustomTooltip(this, function () {
            console.log(d);
            return "Continent:" + cu.formatNumber(d.homecontinent) + "\n" + "City: " + cu.formatNumber(d.homecity) + "\n" + "Employee:" + cu.formatNumber(d.n, "~s");
          });

        })
        .on("mousemove", function () {
          cu.moveCustomTooltip(this)
        })
        .on("mouseleave", function (d) { cu.hideCustomTooltip(); })
        .on("click", function(e){
          /* if(clickToFilter){
          var new_data = data.filter(function(i, n){
            return i[filterSource] == e[filterSource]
          })
          var redraw=new Bubble();
          redraw.props={configName: configName, defined_colors: definedColors, data:new_data,width:re_width, height:re_height, is_bubble: true,legendContainer: 'legend_container'}
          redraw.drawChart();} */

          if (clickToFilter) {
            var selected_field = e.color;
            var newArr = data.filter(function (e) {
              return e[filterSource] == selected_field;
            });
            var redraw = new BubbleMap();
            redraw.props = {configName:configName, defined_colors: definedColors,data: data, width: re_width, height: re_height, legendContainer: legendContainer.slice(1),clickToFilter:clickToFilter,children:children,filterSource:filterSource}
            redraw.drawChart();
          } else if (Object.keys(children).length != 0) {
            var selected_field = e[filterSource];
            var childChart = children;
            if (ifClickChildren) {
              cu.onClickChangeChart(null, re_height, re_width, legendContainer.slice(1), null, null, null, false, pos, configName);
  
            } else {
              cu.onClickChangeChart(childChart, re_height, re_width, legendContainer.slice(1), children.filtertarget, selected_field, true, pos, configName);
  
            }
          }
        }) 
        .style("fill", function (d) { return color(d.homecontinent) })
        //.attr("stroke", function(d){ if(d.n>2000){return "black"}else{return "none"}  })
        .attr("stroke-width", 1)
        .attr("fill-opacity", .6)



      /*  // Add title and explanation
       svg
         .append("text")
           .attr("text-anchor", "end")
           .style("fill", "black")
           .attr("x", width - 10)
           .attr("y", height - 30)
           .attr("width", 90)
           .html("WHERE SURFERS LIVE")
           .style("font-size", 14) */


      // --------------- //
      // ADD LEGEND //
      // --------------- //
      /* 
        // Add legend: circles
        var valuesToShow = [100,4000,15000]
        var xCircle = 40
        var xLabel = 90
        svg
          .selectAll("legend")
          .data(valuesToShow)
          .enter()
          .append("circle")
            .attr("cx", xCircle)
            .attr("cy", function(d){ return height - size(d) } )
            .attr("r", function(d){ return size(d) })
            .style("fill", "none")
            .attr("stroke", "black")
      
        // Add legend: segments
        svg
          .selectAll("legend")
          .data(valuesToShow)
          .enter()
          .append("line")
            .attr('x1', function(d){ return xCircle + size(d) } )
            .attr('x2', xLabel)
            .attr('y1', function(d){ return height - size(d) } )
            .attr('y2', function(d){ return height - size(d) } )
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('2,2'))
      
        // Add legend: labels
        svg
          .selectAll("legend")
          .data(valuesToShow)
          .enter()
          .append("text")
            .attr('x', xLabel)
            .attr('y', function(d){ return height - size(d) } )
            .text( function(d){ return d } )
            .style("font-size", 10)
            .attr('alignment-baseline', 'middle') */
    }


  }




  render() {
    return <div></div>
  }
}

export default BubbleMap;