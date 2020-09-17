import React, { Component } from "react";
import * as d3 from "d3";
import * as cu from "./ChartUtils"
var parent_data = {};

export default class HorizontalStackBarChart extends Component {
  componentDidMount() {
    this.drawChart();
  }

  componentDidUpdate() {
    this.drawChart()
  }

  componentWillReceiveProps() {
    this.drawChart()
  }

  drawChart() {
    const globalColorScheme = /*this.props.color*/ d3.schemeSet2;
    const margin = /*this.props.margin*/{ top: 30, right: 30, bottom: 70, left: 130 };
    const anim_dur = this.props.animation;
    if (this.props.isParent) {
      parent_data = this.props.data
    }
    const xAxisFormat=this.props.xaxisformat;
    const yAxisFormat=this.props.yaxisformat;
    var data = this.props.data
    const y_label = this.props.y_label;
    const x_label = this.props.x_label;
    const legendContainer = "#" + this.props.legendContainer;
    const children = this.props.children;
    const chartContainer = "#" + /*this.props.chartContainer*/"chart-container";
    const clickToFilter=this.props. clickToFilter;
    var configName = this.props.configName;
    var definedColors = this.props.defined_colors;
    const ifClickChildren = this.props.ifClickChildren;
    const filterSource=this.props.filterSource;
    const referenceLineValue=this.props.referenceLineValue,referenceLineColor=this.props.referenceLineColor;
    var selectedField=this.props.selectedField;
    var selectedValue=this.props.selectedValue;
    var pos = this.props.pos;
    var width = this.props.width - margin.left - margin.right;
    var height = this.props.height - margin.top - margin.bottom;
    
    if(selectedValue && selectedField){
      data= data.filter(function (e) {
        return e[selectedField]==selectedValue;
      });
    }
    
    var colors = data.map(function(obj) { return obj.color; });
    colors = colors.filter(function(v,i) { return colors.indexOf(v) == i; });
  
    var subgroups = d3.map(data, function (d) { return d.color; }).keys()
    var color = cu.get_color(subgroups, false, this.props.defined_colors);
    /*************** To Calculate Sum of Y Axis****************/
    var calculatedYaxis = [];
    data.reduce(function (res, value) {
      if (!res[value.y_axis]) {
        res[value.y_axis] = { y_axis: value.y_axis, x_axis: 0 };
        calculatedYaxis.push(res[value.y_axis])
      }
      res[value.y_axis].x_axis += value.x_axis;
      return res;
    }, {});
    /*********************End***********************************/
    var x_axis = [0, d3.max(calculatedYaxis, function (d) { return +d.x_axis })];
    // List of groups = species here = value of the first column called group -> I show them on the X axis
    var groups = d3.map(data, function (d) { return (d.y_axis) }).keys()

    // var subgroups = d3.keys(data[0])
    // subgroups = subgroups.splice(subgroups.indexOf('group') + 1)


    var sumstat = d3.nest()
      .key(function (d) { return d.y_axis; })
      .entries(data);
    let temp = [];

    //stack the data? --> stack per subgroup
    var stackedData = d3.stack()
      .keys(subgroups).value(function (d, key) {
        temp = d.values.find(ele => { if (ele.color == key) return ele.x_axis; });
        if (temp != undefined) return temp.x_axis;
      })(sumstat);
    var leveled_data = []
    stackedData.map((val, i) => {
      var key = val.key
      for (var i = 0; i < val.length; i++) {
        val[i]['key'] = key
        leveled_data.push(val[i])
      }
    })

    margin.left = cu.calculateLeftMargin(groups);
    var width = this.props.width - margin.left - margin.right;
    var height = this.props.height - margin.top - margin.bottom;

    cu.init_svg(chartContainer, legendContainer, margin, width, height)
    cu.createCustomTooltip(chartContainer);

    var xAxisRes = cu.show_x(chartContainer, height, width, x_axis, x_label, margin, anim_dur, d3.easeBack,xAxisFormat,false)

    var yAxisRes = cu.show_y(chartContainer, height, groups, y_label, margin, anim_dur, d3.easeBack)

    var x = xAxisRes[1], y = yAxisRes[1];

    cu.show_legend(legendContainer, subgroups, color)

    // Show the bars
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
          cu.onClickChangeChart(null, re_height, re_width, legendContainer.slice(1), selectedValue, selectedField, false, pos, configName);
        } else{
          if(clickToFilter){
          var redraw = new HorizontalStackBarChart();
          redraw.props = {configName: configName, defined_colors: definedColors, data: parent_data, x_label: x_label, y_label: y_label, x_axis: x_axis, legendContainer: legendContainer.slice(1), height: re_height, width: re_width,clickToFilter:clickToFilter,children:children,filterSource:filterSource }
          redraw.drawChart();
        }}
      })
      

    var rects = svg.select(".shapes")
      .selectAll("rect")
      .data(leveled_data)

    rects.exit().remove();

    rects.enter().append("rect")

    svg.select(".shapes").selectAll("rect")
      .attr("class", function (d) { return "category _" + d.key.replace(/[^a-zA-Z0-9]/g, '') }) // Add a class to each subgroup: their name  
      .on("mouseover", function (d, i, j) {
        cu.showCustomTooltip(this ,function () {
          if(colors.length === 1) return  x_label +": "+ cu.formatNumber(d[1]-d[0],xAxisFormat);
          else return "" + cu.formatNumber(d.key) + "\n" + x_label +": "+ cu.formatNumber(d[1]-d[0],xAxisFormat);
          });
        
        cu.mouseover(d, i, j);
      })
      .on("mousemove", function () {
        cu.moveCustomTooltip(this )
      })
      .on("mouseleave", function (d) { cu.hideCustomTooltip(); cu.mouseleave(d) })
      .on("click", function (d) {
        if (clickToFilter) {
          var selected_field = d.key;
          var newArr = data.filter(function (e) {
            return e[filterSource]==selected_field;
        });
          var redraw = new HorizontalStackBarChart();
          redraw.props = {configName: configName, defined_colors: definedColors, data: newArr, width: re_width, height: re_height, x_label: x_label, y_label: y_label, legendContainer: legendContainer.slice(1),clickToFilter:clickToFilter,children:children,filterSource:filterSource }
          redraw.drawChart();
        }
        else if (Object.keys(children).length !== 0) {
          var childChart = children;
          var matchCase=d.key;
          var position=0; 
          for(var i=0;i<d.data.values.length;i++){
            var arrOfKey=Object.entries(d.data.values[i])[0];
            var arrofValues=Object.entries(d.data.values[i])[1];
            if(arrofValues.indexOf(matchCase)!=-1){
              position=i;
              
            }


          }

          var selected_field=d.data.values[position][filterSource];
          

          if(ifClickChildren){
            cu.onClickChangeChart(null, re_height, re_width, null, selectedValue, selectedField, false, pos, configName);  

          } else {
            cu.onClickChangeChart(childChart, re_height, re_width, legendContainer.slice(1), children.filtertarget, selected_field,true,pos, configName);

          }

        }
      })

      .transition().duration(anim_dur).ease(d3.easeBack)
      .style('fill', "")
      .attr('rx', 0)
      .attr('rx', 0)
      .attr("fill", function (d) { return color(d.key); })
      .attr("y", function (d) { return y(d.data.key); })
      .attr("x", function (d) { return x(d[0]); })
      .attr("width", function (d) { var a=x(d[1]) - x(d[0]); if(isNaN(a)){a=0} return a; })
      .attr("height", y.bandwidth())
      .style("opacity", 1)
      .style("border", 'none')

      
      svg.select(".shapes").selectAll('rect').each(function (d){
        if(typeof (d3.select(this).attr('height'))=="string"){
       if(d3.select(this).attr('height')===null||d3.select(this).attr('width')===null){
         d3.select(this).remove();
       }}
      })
      /* cu.tooltip(svg.select('.shapes').selectAll('rect'), function (res, that) {
        var subgroupName = d3.select(that).node(); // This was the tricky part
        var newParent = d3.select(subgroupName).datum().key;
        return "" + cu.formatNumber(res.key) + "\n" + x_label +": "+ cu.formatNumber(res[1]-res[0],xAxisFormat);
      }) */

      if(referenceLineValue!=undefined){cu.addReferenceLine(svg.select('.shapes'), groups, referenceLineValue,referenceLineColor, x, y);}
      else{svg.select(".shapes").selectAll('.regression').remove();}

  }

  render() {
    return <div></div>
  }
}
