import React, { Component } from "react";
import * as d3 from "d3";
import * as cu from "./ChartUtils"

var globalColorScheme = d3.schemeSet2;
var parent_data = {};
var parent_width;
var parent_height;

class StackBarChart extends Component {
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

    var data = this.props.data;
    var configName = this.props.configName;
    const y_label = this.props.y_label;
    const x_label = this.props.x_label;
    const children = this.props.children;
    const legendContainer = "#" + this.props.legendContainer;
    const selectedField = this.props.selectedField, selectedValue = this.props.selectedValue;
    const ifClickChildren = this.props.ifClickChildren;
    const filterSource = this.props.filterSource;
    const clickToFilter = this.props.clickToFilter;
    const referenceLineValue = this.props.referenceLineValue, referenceLineColor = this.props.referenceLineColor;
    var pos = this.props.pos;
    const chartContainer = "#" + /*this.props.chartContainer*/"chart-container";
    const xAxisFormat = this.props.xaxisformat;
    const yAxisFormat = this.props.yaxisformat;
    if (this.props.isParent) {
      parent_data = this.props.data;
      parent_width = this.props.width;
      parent_height = this.props.height
    }
    var definedColors = this.props.defined_colors;
    var width = this.props.width - margin.left - margin.right;
    var height = this.props.height - margin.top - margin.bottom;
    var subgroups = d3.map(data, function (d) { return d.color; }).keys()
    //subgroups = subgroups.splice(subgroups.indexOf('group') + 1);

    data = data.filter(function (e) {
      return e[selectedField] == selectedValue;
    });
    var colors = data.map(function(obj) { return obj.color; });
    colors = colors.filter(function(v,i) { return colors.indexOf(v) == i; });

    var color = cu.get_color(subgroups, false, this.props.defined_colors);
    /*************** To Calculate Sum of Y Axis****************/
    var calculatedYaxis = [];
    data.reduce(function (res, value) {
      if (!res[value.x_axis]) {
        res[value.x_axis] = { x_axis: value.x_axis, y_axis: 0 };
        calculatedYaxis.push(res[value.x_axis])
      }
      res[value.x_axis].y_axis += value.y_axis;
      return res;
    }, {});
    /*********************End***********************************/
    var y_axis = [0, d3.max(calculatedYaxis, function (d) { return +d.y_axis })];
    // List of groups = species here = value of the first column called group -> I show them on the X axis
    var groups = d3.map(data, function (d) { return (d.x_axis) }).keys();
    //1. Calculate margin based on y-axis labels
    //2. Calculate width based on new left margin
    margin.left = cu.calculateLeftMargin(y_axis);
    var width = this.props.width - margin.left - margin.right;
    var height = this.props.height - margin.top - margin.bottom;
    cu.init_svg(chartContainer, legendContainer, margin, width, height);
    var xAxisRes = cu.show_x(chartContainer, height, width, groups, x_label, margin, anim_dur, d3.easeBack);
    var yAxisRes = cu.show_y(chartContainer, height, y_axis, y_label, margin, anim_dur, d3.easeBack);
    cu.show_legend(legendContainer, subgroups, color, false);
    cu.createCustomTooltip(chartContainer);
    var x = xAxisRes[1], y = yAxisRes[1];

    var sumstat = d3.nest()
      .key(function (d) { return d.x_axis; })
      .entries(data);
    let temp = [];

    //stack the data? --> stack per subgroup
    var stackedData = d3.stack()
      .keys(subgroups).value(function (d, key) {
        temp = d.values.find(ele => { if (ele.color == key) return ele.y_axis; });
        if (temp != undefined) return temp.y_axis;
      })(sumstat);
    var leveled_data = []
    stackedData.map((val, i) => {
      var key = val.key
      for (var i = 0; i < val.length; i++) {
        val[i]['key'] = key
        leveled_data.push(val[i])
      }
    })

    var svg = d3.select(chartContainer).select('svg').select(".chart")

    svg.select(".meta").selectAll("*").remove()

    if (svg.select(".shapes").selectAll("rect").size() === 0) {
      svg.selectAll("*").remove()
      svg.append("g")
        .attr('class', 'meta')
      svg.append("g")
        .attr('class', 'shapes')
    }

    var re_width = this.props.width
    var re_height = this.props.height;

    svg.select('.meta').append('rect').attr('width', width).attr('height', height).style('opacity', 0)
      .on('dblclick', function (i, n) {
        if (ifClickChildren) {
          cu.onClickChangeChart(null, re_height, re_width, null, null, null, false, pos, configName);

        } else {
          if (clickToFilter) {
            var redraw = new StackBarChart();
            redraw.props = {configName: configName, defined_colors: definedColors, data: parent_data, x_label: x_label, y_label: y_label, y_axis: y_axis, legendContainer: legendContainer.slice(1), height: re_height, width: re_width, clickToFilter: clickToFilter, children: children, filterSource: filterSource, referenceLineValue: referenceLineValue, referenceLineColor: referenceLineColor }
            redraw.drawChart();
          }
        }
      })


    var rects = svg.select(".shapes")
      .selectAll("rect")
      .data(leveled_data)

    rects.exit().remove();

    rects.enter().append("rect")

    svg.select(".shapes").selectAll("rect")
      .attr("class", function (d) { return "category _" + d.key.replace(/[^a-zA-Z0-9]/g, '') }) // Add a class to each subgroup: their name  
      .on("mouseover", function (d, i, j) {
        cu.showCustomTooltip(this,function () {
            if(colors.length === 1) return  y_label +": "+ cu.formatNumber(d[1]-d[0],yAxisFormat);
            else return "" + cu.formatNumber(d.key) + "\n"+x_label+": "+d.data.key+"\n" + y_label +": "+ cu.formatNumber(d[1]-d[0],yAxisFormat);
          });
        
        cu.mouseover(d, i, j);
      })
      .on("mousemove", function () {
        cu.moveCustomTooltip(this)
      })
      .on("mouseleave", function (d) { cu.hideCustomTooltip(); cu.mouseleave(d) })
      .on("click", function (d) {
        var childChart = children;
        if (clickToFilter) {
          var selected_field = d.key;
          var newArr = data.filter(function (e) {
            return e[filterSource] == selected_field;
          });
          var redraw = new StackBarChart();
          redraw.props = {configName: configName, defined_colors: definedColors, data: newArr, width: re_width, height: re_height, x_label: x_label, y_label: y_label, y_axis: y_axis, legendContainer: legendContainer.slice(1), clickToFilter: clickToFilter, children: children, filterSource: filterSource, referenceLineValue: referenceLineValue, referenceLineColor: referenceLineColor }
          redraw.drawChart();
        }
        else if (Object.keys(children).length != 0) {
          var matchCase=d.key;
          var position=0; 
          for(var i=0;i<d.data.values.length;i++){
            var arrOfKey=Object.entries(d.data.values[i])[0];
            var arrofValues=Object.entries(d.data.values[i])[1];
            if(arrofValues.indexOf(matchCase)!=-1){
              position=i;
              
            }


          }
          var selected_field = d.data.values[position][filterSource];
          if (ifClickChildren) {
            cu.onClickChangeChart(null, re_height, re_width, null, null, null, false, pos, configName);
          } else {
            cu.onClickChangeChart(childChart, re_height, re_width, legendContainer.slice(1), children.filtertarget, selected_field, true, pos, configName);
          }
        }
      })
      .transition().duration(anim_dur).ease(d3.easeBack)
      .style('fill', "")
      .attr('rx', 0)
      .attr('rx', 0)
      .attr("fill", function (d) { return color(d.key); })
      .attr("x", function (d) { return x(d.data.key); })
      .attr("y", function (d) { return y(d[1]); })
      .attr("height", function (d) { var a = y(d[0]) - y(d[1]); if (isNaN(a)) { a = 0 } return a; })
      .attr("width", x.bandwidth())
      .style("opacity", 1)

    svg.select(".shapes").selectAll('rect').each(function (d) {
      if (typeof (d3.select(this).attr('height')) == "string") {
        if (d3.select(this).attr('height') === null || d3.select(this).attr('width') === null) {
          d3.select(this).remove();
        }
      }
    })

    // cu.tooltip(svg.select(".shapes").selectAll("rect"), function (res, that) {
    //   var subgroupName = d3.select(that).node(); // This was the tricky part
    //   var newParent = d3.select(subgroupName).datum().key;
    //   return "" + cu.formatNumber(res.key) + "\n" + y_label +": "+ cu.formatNumber(res[1]-res[0],yAxisFormat);
    // })

    if (referenceLineValue != undefined) { cu.addReferenceLine(svg.select('.shapes'), groups, referenceLineValue, referenceLineColor, x, y); }
    else { svg.select(".shapes").selectAll('.regression').remove(); }
  }

  render() {
    return <div></div>
  }
}

export default StackBarChart;