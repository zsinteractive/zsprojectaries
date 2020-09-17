import React, { Component } from "react";
import * as d3 from "d3";
import * as cu from "./ChartUtils"
import { isNumber } from "underscore";

var parent_data = {};

class BubbleChart extends Component {

  componentDidMount() {
    this.drawChart()
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
    var secondAxis = 0/* this.props.secondAxis */;
    var configName = this.props.configName;
    const isBubble = this.props.is_bubble;

    data = data.filter(function (e) {
      return e[selectedField] == selectedValue;
    });

    var colors = data.map(function (obj) { return obj.color; });
    colors = colors.filter(function (v, i) { return colors.indexOf(v) == i; });


    var z = d3.scaleLinear()
      .domain(d3.extent(data, d => d.value))
      .range([10, 20]);

    var groups = data.map(d => { return d.color })

    groups = [...new Set(groups)];

    var color = cu.get_color(groups, false, this.props.defined_colors);
    //1. Calculate margin based on y-axis labels
    //2. Calculate width based on new left margin
    var y_group = d3.extent(data, d => d.y_axis);
    margin.left = cu.calculateLeftMargin(y_group);
    var width = this.props.width - margin.left - margin.right;
    var height = this.props.height - margin.top - margin.bottom;
    cu.init_svg(chartContainer, legendContainer, margin, width, height);
    cu.createCustomTooltip(chartContainer);
    cu.show_legend(legendContainer, groups, color, false, false, 0.5);

    var svg = d3.select(chartContainer).select('svg').select(".chart")

    svg.select(".meta").selectAll("*").remove()
    svg.select(".shapes").selectAll('text').remove()
    svg.select(".shapes").selectAll('path').remove()

    if (svg.select(".shapes").selectAll("circle").size() === 0) {
      svg.selectAll("*").remove()
      svg.append("g")
        .attr('class', 'meta')
      svg.append("g")
        .attr('class', 'shapes')
    }


    var circles = svg.select(".shapes").selectAll("circle").data(data)

    circles.exit().remove()

    circles.enter().append("circle")

    var re_height = this.props.height;
    var re_width = this.props.width;

    let unique_value_count = new Set(data.map(x => x.value)).size;
    svg.select(".shapes").selectAll("circle")
      //.attr('class','scatter_circle')
      .attr('transform', null)
      .attr("class", function (d) { return "category _" + d.color.replace(/[^a-zA-Z0-9]/g, '') + " scatter_circle" })
      .on("mouseover", function (d, i, j) {
        cu.showCustomTooltip(this, function () {
          if (colors.length === 1) return x_label + ": " + cu.formatNumber(d.x_axis, xAxisFormat) + "\n" + y_label + ": " + cu.formatNumber(d.y_axis, yAxisFormat) + (unique_value_count > 1 ? "\nValue: " + cu.formatNumber(d.value) : "") + (d.lod != undefined ? "\n" + cu.formatNumber(d.lod) : "");
          return cu.formatNumber(d.color) + "\n" + x_label + ": " + cu.formatNumber(d.x_axis, xAxisFormat) + "\n" + y_label + ": " + cu.formatNumber(d.y_axis, yAxisFormat) + (unique_value_count > 1 ? "\nValue: " + cu.formatNumber(d.value) : "") + (d.lod != undefined ? "\n" + cu.formatNumber(d.lod) : "");
        });


        cu.mouseover(d, i, j);
      })
      .on("mousemove", function () {
        cu.moveCustomTooltip(this)
      })
      .on("mouseleave", function (d) {
        cu.hideCustomTooltip();
        d3.selectAll(".category").style("opacity", 0.5)
      })
      .on("click", function (d) {
        if (clickToFilter) {
          var selected_field = d.color;
          var newArr = data.filter(function (e) {
            return e[filterSource] == selected_field;
          });
          var redraw = new BubbleChart();
          redraw.props = { configName: configName, defined_colors: definedColors, data: newArr, width: re_width, height: re_height, x_label: x_label, y_label: y_label, legendContainer: legendContainer.slice(1), clickToFilter: clickToFilter, children: children, filterSource: filterSource, referenceLineValue: referenceLineValue, referenceLineColor: referenceLineColor, yaxisformat: yAxisFormat, xaxisFormat: xAxisFormat }
          redraw.drawChart();
        } else if (Object.keys(children).length != 0) {
          var selected_field = d[filterSource];
          var childChart = children;
          if (ifClickChildren) {
            cu.onClickChangeChart(null, re_height, re_width, null, null, null, false, pos, configName);

          } else {
            cu.onClickChangeChart(childChart, re_height, re_width, legendContainer.slice(1), children.filtertarget, selected_field, true, pos, configName);

          }
        }
      })
      .attr("r", function (d) { return z(d.value); })
      .style("fill", function (d) { return color(d.color); })
      .style("opacity", 0.5)




    var x_group = d3.extent(data, d => d.x_axis);

    var y_group = d3.extent(data, d => d.y_axis);

    var xAxisRes = cu.show_x(chartContainer, height, width, x_group, x_label, margin, anim_dur, d3.easeBack, xAxisFormat);

    var yAxisRes = cu.show_y(chartContainer, height, y_group, y_label, margin, anim_dur, d3.easeBack, yAxisFormat);

    var xAxis = xAxisRes[0], yAxis = yAxisRes[0], x = xAxisRes[1], y = yAxisRes[1]


    if (secondAxis == 1) {
      var yAxisResSecond = cu.show_second_axis(chartContainer, height, width, y_group, y_label, margin, anim_dur, d3.easeBack)
      var y2 = yAxisResSecond[1];
    }

    var zoom = d3.zoom()
      .scaleExtent([0.1, 20])
      .extent([[0, 0], [width, height]])
      .on("zoom", updateChart);

    // Add brushing
    var brush = d3.brush()                 // Add the brush feature using the d3.brush function
      .extent([[0, 0], [re_width - margin.left, re_height - margin.bottom]]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function


    svg.select(".shapes").attr("clip-path", "url(#clip)");


    svg.select(".meta").append("g")
      .attr("class", "brush")
      .on('dblclick', function (i, n) {

        if (ifClickChildren) {
          cu.onClickChangeChart(null, re_height, re_width, legendContainer, null, null, false, pos, configName);

        } else {
          if (clickToFilter) {

            var redraw = new BubbleChart();
            redraw.props = { configName: configName, defined_colors: definedColors, data: parent_data, width: re_width, height: re_height, x_label: x_label, y_label: y_label, legendContainer: legendContainer.slice(1), clickToFilter: clickToFilter, children: children, filterSource: filterSource, referenceLineValue: referenceLineValue, referenceLineColor: referenceLineColor, yaxisformat: yAxisFormat, xaxisFormat: xAxisFormat }
            redraw.drawChart();
          }
        }
      })
      .call(brush);

    // Add a clipPath: everything out of this area won't be drawn.
    var clip = svg.select(".meta").append("defs").append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", width)
      .attr("height", height)
      .attr("x", 0)
      .attr("y", 0);


    /*  svg.select(".shapes").selectAll(".scatter_circle")
       .transition().duration(anim_dur).ease(d3.easeBack)
       .attr("cx", function (d) { return x(d.x_axis); })
       .attr("cy", function (d) { return y(d.y_axis); })
*/
    d3.forceSimulation()
      .alphaDecay(0.5)
      .nodes(data)
      .on("tick", function (d) {
        svg.select(".shapes").selectAll('.scatter_circle')
          .transition().duration(anim_dur).ease(d3.easeBack)
          .attr("cx", function (d) { return x(d.x_axis); })
          .attr("cy", function (d) { return y(d.y_axis); })
      });
    /*   cu.tooltip(svg.select(".shapes").selectAll('circle'), function (res, that) {
        return cu.formatNumber(res.color) + "\n" + x_label + ": " + cu.formatNumber(res.x_axis,xAxisFormat) + "\n" + y_label + ": " + cu.formatNumber(res.y_axis,yAxisFormat) + "\nValue: " +cu.formatNumber(res.value);
      }) */

if(secondAxis==1){
  cu.secondAxisScatterChart(svg.select('.shapes'),data,x,y2,z,color,xAxisFormat,yAxisFormat)
}

    if (referenceLineValue != undefined) { cu.addReferenceLine(svg.select('.shapes'), x_group, referenceLineValue, referenceLineColor, x, y); }
    else { svg.select(".shapes").selectAll('.regression').remove(); }



    var idleTimeout
    function idled() { idleTimeout = null; }

    function updateChart() {
      const extent = d3.event.selection

      // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if (!extent) {
        // if (!idleTimeout) return idleTimeout = setTimeout(idled, 350) // This allows to wait a little bit
        // x.domain([ 4,8])
        var limitData = d3.extent(data, function (d) { return d.x_axis; });

        if (limitData[0] < 0) limitData[0] = 1.08 * limitData[0]
        else limitData[0] = 0.08 * limitData[0]


        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
        x.domain(limitData).nice();
        y.domain(d3.extent(data, function (d) { return d.y_axis; })).nice();
      } else {
        x.domain([extent[0][0], extent[1][0]].map(x.invert, x));
        y.domain([extent[1][1], extent[0][1]].map(y.invert, y));
        svg.select(".meta").select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
      }


      // update axes with these new boundaries
      xAxis.call(cu.xAxisTickFormat(x, isNumber(x.domain()[0]), xAxisFormat, x.domain()))
      //xAxis.call(isNumber(x.domain()[0]) ? d3.axisBottom(x).tickFormat(function(d){ if(d<1&&d>-1)return d;else return d3.format("~s")(d);}) : d3.axisBottom(x))
      yAxis.call(isNumber(y.domain()[0]) ? d3.axisLeft(y).tickFormat(function (d) { if (d < 1 && d > -1) return d; else return d3.format("~s")(d); }) : d3.axisLeft(y))

      // update circle position
      svg.select(".shapes")
        .selectAll("circle")
        .attr('cx', function (d) { return x(d.x_axis) })
        .attr('cy', function (d) { return y(d.y_axis) });
    }

  }

  render() {
    return <div></div>
  }

}

export default BubbleChart;