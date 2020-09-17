import React, { Component } from "react";
import * as d3 from "d3";
import * as cu from "./ChartUtils"


export default class HeatChart extends Component {
    componentDidMount() {
        this.drawChart()
    }

    componentDidUpdate(){
      this.drawChart()
    }
    
    drawChart() {
      const margin = /*this.props.margin*/{ top: 30, right: 100, bottom: 70, left: 130 };   
      const anim_dur = this.props.animation; 
      const legend_range = this.props.legendRange
      const xAxisFormat=this.props.xaxisformat;
      const yAxisFormat=this.props.yaxisformat;
      var data = this.props.data
      const y_label = this.props.y_label;
      const x_label = this.props.x_label;
      const legendContainer = "#" + this.props.legendContainer;
      const chartContainer = "#" + /*this.props.chartContainer*/"chart-container";
      const selectedField=this.props.selectedField,selectedValue=this.props.selectedValue;
      const ifClickChildren = this.props.ifClickChildren;
      var pos = this.props.pos;
      var configName = this.props.configName;
      var width = this.props.width - margin.left - margin.right;
      var height = this.props.height - margin.top - margin.bottom;    

      // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
      var myGroups = d3.map(data, function(d){return d.x_axis}).keys()
      var myVars = d3.map(data, function(d){return d.y_axis}).keys()  
      
      if(selectedField!=null&&selectedValue!=null){
        data= data.filter(function (e) {
           return e[selectedField]==selectedValue;
       });
       } 

      // Build color scale
      var myColor = cu.get_color(legend_range, true, this.props.defined_colors)
      //1. Calculate margin based on y-axis labels
      //2. Calculate width based on new left margin
      margin.left = cu.calculateLeftMargin(myVars);
      var width = this.props.width - margin.left - margin.right;
      var height = this.props.height - margin.top - margin.bottom;  
      
      cu.init_svg(chartContainer, legendContainer, margin, width, height)
      cu.createCustomTooltip(chartContainer);

      var xAxisRes= cu.show_x(chartContainer, height, width, myGroups, x_label, margin, anim_dur, d3.easeBack)
      
      var yAxisRes= cu.show_y(chartContainer, height,  myVars, y_label, margin, anim_dur, d3.easeBack)
      
      var x=xAxisRes[1],y=yAxisRes[1];
      
      cu.show_legend(legendContainer, legend_range, myColor, true, true)
  
      var svg = d3.select(chartContainer).select('svg').select(".chart")

      svg.select(".meta").selectAll("*").remove()      
          
      // add the squares 

      if(svg.select(".shapes").selectAll("rect").size()===0){
        svg.selectAll("*").remove()
        svg.append("g")
        .attr('class', 'meta')   
        svg.append("g")
        .attr('class', 'shapes')           
      }
      var pos = this.props.pos;
      var re_height = this.props.height;
      var re_width = this.props.width;
      svg.select('.shapes')
      .on('dblclick', function(){
        if(ifClickChildren){
          cu.onClickChangeChart(null, re_height, re_width, null, null, null, false, pos, configName)
        }
        
      })
      var rects = svg.select(".shapes")
                      .selectAll('rect')
                      .data(data, function(d) {return d.x_axis+':'+d.y_axis;})

      rects.exit().remove();

      rects.enter().append("rect")
      .on("mouseover", function (d, i, j) {
        cu.showCustomTooltip(this ,function () {
          return cu.formatNumber(d.value);
          });
        
      })
      .on("mousemove", function () {
        cu.moveCustomTooltip(this )
      })
      .on("mouseleave", function (d) { cu.hideCustomTooltip();})   
          .transition().duration(anim_dur).ease(d3.easeBack)  
          .attr("x", function(d) { return x(d.x_axis) })
          .attr("y", function(d) { return y(d.y_axis) })       
          .attr("width",x.bandwidth() )
          .attr("height", y.bandwidth() )
          .style("fill", function(d) {return myColor(d.value)} )
          .style("stroke-width", 4)
          .style("stroke", "none")
          .style("opacity", 0.8)      

          /* cu.tooltip(svg.select(".shapes").selectAll('rect'),function(res,that){
            return cu.formatNumber(res.value);
          }) */
            
    }    

    render() {
        return <div> </div>
    }

}