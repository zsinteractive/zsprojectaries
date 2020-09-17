import React, { Component } from "react";
import * as d3 from "d3";
import * as cu from "./ChartUtils"
import { isNumber } from "underscore";

var parent_data = {};

class Bubble extends Component {
    
    componentDidMount() {
      this.drawChart()
    }
    componentDidUpdate(){
      this.drawChart()
    }

    drawChart() {
      const globalColorScheme = /*this.props.color*/ d3.schemeSet2;
      const margin = /*this.props.margin*/{ top: 30, right: 30, bottom: 70, left: 130 };   
      const anim_dur = this.props.animation; 
      if(this.props.isParent){
        parent_data = this.props.data
      }
      var definedColors = this.props.defined_colors;
      const data = this.props.data // Data for the Chart
      const y_axis = this.props.y_axis// YAxis Range
      const yLabel = this.props.y_label;// YAxis Label
      const xLabel = this.props.x_label;// XAxis Label
      const legendContainer = "#" + this.props.legendContainer;// Container ID for the Chart Legend
      const chartContainer = "#" + /*this.props.chartContainer*/"chart-container";//Conatianer ID for the Chart
      var width = this.props.width - margin.left - margin.right;// Calculated width for the SVG
      var height = this.props.height - margin.top - margin.bottom;// Calculated height for the SVG
      const ifClickChildren = this.props.ifClickChildren;
      const children = this.props.children;
      var pos = this.props.pos;
      const clickToFilter=this.props.clickToFilter;
      const filterSource=this.props.filterSource;
      var zLowerLimit,zUpperLimit,outterCircleRadius;
      var configName = this.props.configName;
      // if(dataLength<10){zLowerLimit=30;zUpperLimit=40;outterCircleRadius=48}
      // else if(dataLength>=10&&dataLength<40){zLowerLimit=10;zUpperLimit=50;outterCircleRadius=45}
      // else if(dataLength>=30&&dataLength<60){
        zLowerLimit=10; zUpperLimit=20; outterCircleRadius=28
      // else{zLowerLimit=5;zUpperLimit=10;outterCircleRadius=18}
      
      if(this.props.zLowerLimit) zLowerLimit = this.props.zLowerLimit
      if(this.props.zUpperLimit) zUpperLimit = this.props.zUpperLimit
      if(this.props.outterCircleRadius) outterCircleRadius = this.props.outterCircleRadius
      //Assign Radius to circle
      var z = d3.scaleLinear()
        .domain(d3.extent(data, d => d.value))
        .range([zLowerLimit, zUpperLimit]);         
      
      //Mapping of groups
      var groups = data.map(d=>{return d.color})

      groups = [...new Set(groups)];
      let unique_value_count = new Set(data.map(x=>x.value)).size;

      //Assigning color scheme
      var color=cu.get_color(groups, false, this.props.defined_colors);
      //Initializes SVG element
      cu.init_svg(chartContainer,legendContainer,margin,width,height);  
      d3.select(chartContainer).select('svg').select('.trans').attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      // Add legend for the Chart
      cu.show_legend(legendContainer, groups, color);      
      cu.createCustomTooltip(chartContainer);
     
      var svg = d3.select(chartContainer).select('svg').select(".chart")

      svg.select(".meta").selectAll("*").remove()//Clears the SVG Meta element
      
      svg.select(".shapes").selectAll('text').remove()
      svg.select(".shapes").selectAll('path').remove()


     if (svg.select(".shapes").selectAll("circle").size() === 0) {
        svg.selectAll("*").remove()
        svg.append("g")
        .attr('class', 'meta')
        svg.append("g")
        .attr('class', 'shapes')        
     }     
      
      var re_height = this.props.height;
      var re_width = this.props.width;

      //Add double Click functionality to the meta element
      svg.select('.meta').append('rect').attr('width', width).attr('height', height).style('opacity', 0)
      .on('dblclick', function(i, n){
        var redraw=new Bubble();
        redraw.props = {configName:configName, defined_colors: definedColors,data: parent_data, width: re_width, height: re_height, legendContainer: legendContainer.slice(1),clickToFilter:clickToFilter,children:children,filterSource:filterSource,}
        redraw.drawChart();
      }) 
    
      var circles = svg.select(".shapes").selectAll("circle").data(data)

      circles.exit().remove()//Clears the circle element

      circles.enter().append("circle")
      
      var colors = data.map(function(obj) { return obj.color; });
      colors = colors.filter(function(v,i) { return colors.indexOf(v) == i; });

      svg.select(".shapes").selectAll("circle") 
          .attr('transform',null)
          .attr("class", function (d) { return "category _" + d.color.replace(/[^a-zA-Z0-9]/g, '') +" bubble_circle"})
          .on("mouseover", function (d, i, j) {
            cu.showCustomTooltip(this,function () {
              if(colors.length === 1) return (unique_value_count>1?"\nValue: " +cu.formatNumber(d.value)+"\n":"")+(d.lod!=undefined?""+cu.formatNumber(d.lod):"");
              return cu.formatNumber(d.color)+(unique_value_count>1?"\nValue: " +cu.formatNumber(d.value):"")+(d.lod!=undefined?"\n"+cu.formatNumber(d.lod):"");
              });
            
            cu.mouseover(d, i, j);
          })
          .on("mousemove", function () {
            cu.moveCustomTooltip(this)
          })
          .on("mouseleave", function (d) { cu.hideCustomTooltip(); cu.mouseleave(d) })          
          .attr("r", function (d) { return z(d.value); })
          .style("fill",function (d) { return color(d.color); })
          .style("opacity", 1)
          .style('cursor', 'pointer')
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
              var redraw = new Bubble();
              redraw.props = {configName:configName, defined_colors: definedColors,data: newArr, width: re_width, height: re_height, legendContainer: legendContainer.slice(1),clickToFilter:clickToFilter,children:children,filterSource:filterSource}
              redraw.drawChart();
            } else if (Object.keys(children).length != 0) {
              var selected_field = e[filterSource];
              var childChart = children;
              if (ifClickChildren) {
                cu.onClickChangeChart(null, re_height, re_width, null, null, null, false, pos, configName);
    
              } else {
                cu.onClickChangeChart(childChart, re_height, re_width, legendContainer.slice(1), children.filtertarget, selected_field, true, pos, configName);
    
              }
            }
          }) 
          
    svg.select(".shapes").selectAll('.regression').remove();
        /*   
       if(!isBubble){   
                
        var x_group=d3.extent(data, d => d.x_axis);

        var y_group=d3.extent(data, d => d.y_axis);

        var xAxisRes=cu.show_x(chartContainer, height, width, x_group, xLabel, margin, anim_dur, d3.easeBack);
 
        var yAxisRes= cu.show_y(chartContainer, height,  y_group, yLabel, margin, anim_dur, d3.easeBack);
 
        var xAxis=xAxisRes[0], yAxis=yAxisRes[0], x=xAxisRes[1], y=yAxisRes[1]

        var zoom = d3.zoom()
        .scaleExtent([.5, 20])  
        .extent([[0, 0], [width, height]])
        .on("zoom", updateChart);          

        svg.select(".meta").append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr('transform', 'translate(' + margin.top + ',' + margin.top + ')')
            .call(zoom);

        // Add a clipPath: everything out of this area won't be drawn.
        var clip = svg.select(".meta").append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", 0)
            .attr("y", 0);

        svg.select(".shapes").attr("clip-path", "url(#clip)"); 

        svg.select(".shapes").selectAll("circle") 
          .transition().duration(anim_dur).ease(d3.easeBack)
          .attr("cx", function (d) { return x(d.x_axis); })
          .attr("cy", function (d) { return y(d.y_axis); })

        cu.tooltip(svg.select(".shapes").selectAll('circle'),function(res,that){
          return res.color+"\n"+xLabel+": "+res.x_axis+"\n"+ yLabel+": "+res.y_axis+"\nValue: "+res.value;
        }) 

      }  */
      //else{
        var attraction = this.props.attraction?this.props.attraction:40;
        var alphaDecay = this.props.alphaDecay?this.props.alphaDecay:0.5;
        var collide = this.props.collide?this.props.collide:0.3;

        d3.select(chartContainer).select('svg').select(".trans").selectAll(".x_axis, .y_axis, .x_lable, .y_lable").remove();
        /* svg.select(".shapes").selectAll("circle") 
        .transition().duration(anim_dur).ease(d3.easeBack)
        .attr("cx", function (d) { return  d.x; })
        .attr("cy", function (d) { return  d.y; }) */

        d3.select(chartContainer).select('svg').select(".trans").selectAll(".x_axis, .y_axis").remove();
        var simulation = d3.forceSimulation()
        .force("center", d3.forceCenter(width / 2, height / 2)) // Attraction to the center of the svg area
        .force("charge", d3.forceManyBody().strength(attraction)) // Nodes are attracted one each other of value is > 0
        .force("collide", d3.forceCollide().strength(collide).radius(outterCircleRadius).iterations(1)) // Force that avoids circle overlapping
        .alphaDecay(alphaDecay)

        simulation
        .nodes(data)
        .on("tick", function (d) {
          svg.select(".shapes").selectAll('.bubble_circle')
          .transition().duration(200).ease(d3.easeLinear)
          .attr("cx", function (d) { return  d.x; })
          .attr("cy", function (d) { return  d.y; })
        }); 

               

        // cu.tooltip(svg.select(".shapes").selectAll('circle'),function(res,that){
        //   return cu.formatNumber(res.color)+"\nValue: "+cu.formatNumber(res.value);
        // })
        
    //  }                           

      /* function updateChart() {

          // recover the new scale
          var newX = d3.event.transform.rescaleX(x);
          var newY = d3.event.transform.rescaleY(y);                              
        
          // update axes with these new boundaries

          xAxis.call(isNumber(newX.domain()[0])?d3.axisBottom(newX).tickFormat(d3.format("~s")):d3.axisBottom(newX))
          yAxis.call(isNumber(newY.domain()[0])?d3.axisLeft(newY).tickFormat(d3.format("~s")):d3.axisLeft(newY))

          // update circle position
          svg.select(".shapes")
            .selectAll("circle")
            .attr('cx', function(d) {return newX(d.x_axis)})
            .attr('cy', function(d) {return newY(d.y_axis)});
      }  */

  }

  render() {
    return <div></div>
  }
  
}

export default Bubble;