import React, { Component } from "react";
import * as d3 from "d3";
import * as cu from "./ChartUtils"
import * as topojson from "topojson-client"
import masterdata from './../data.json'
import masterstates from './../states.json'
import masterus from './../us.json'
import { isNull } from "underscore";

class ChoroplethChart extends Component {

    componentDidMount() {
        this.drawChart()
    }
    componentDidUpdate() {
        this.drawChart()
    }

    drawChart() {
        const margin = /*this.props.margin*/{ top: 30, right: 30, bottom: 70, left: 130 };

        const data = Object.assign(new Map(this.props.data));
        console.log("map",data);
        const us = masterus;
        const states = new Map(us.objects.states.geometries.map(d => [d.id, d.properties]));  // Data for the Chart
        const legendContainer = "#" + this.props.legendContainer;// Container ID for the Chart Legend
        const chartContainer = "#" + /*this.props.chartContainer*/"chart-container";//Conatianer ID for the Chart
        const clickToFilter=this.props. clickToFilter;
        var configName = this.props.configName;
        var hideTooltipBottomValue = this.props.hideTooltipBottomValue;
        const ifClickChildren = this.props.ifClickChildren;
        const children = this.props.children;
        var width = this.props.width - margin.left - margin.right;// Calculated width for the SVG
        var height = this.props.height - margin.top - margin.bottom;// Calculated height for the SVG
        const legend_range = this.props.legendRange;
        const filterSource=this.props.filterSource;
        var pos = this.props.pos;
        const referenceLineValue = this.props.referenceLineValue, referenceLineColor = this.props.referenceLineColor;
        var color = /* d3.scaleQuantize([1, 10], d3.schemeBlues[9]) */ cu.get_color(legend_range, true, this.props.defined_colors), path = d3.geoPath(), format = d => `${d}`;
        const transform = d3.zoomIdentity;
        cu.init_svg(chartContainer, legendContainer, margin, width, height);
       
        var svg = d3.select(chartContainer).select('svg').select(".chart");
        cu.hideAxes(chartContainer);
        cu.createCustomTooltip(chartContainer);
        d3.select(chartContainer).select('svg').select('.trans').attr("transform", "translate(0,0)");

        if(pos>0){
        cu.show_legend(legendContainer, legend_range, color, true, true)
}
        var re_width = this.props.width
        var re_height = this.props.height;
    
        svg.select('.meta').append('rect').attr('width', width).attr('height', height).style('opacity', 0)
        .on('dblclick', function (i, n) {
          if (ifClickChildren) {
            cu.onClickChangeChart(null, re_height, re_width, legendContainer.slice(1), null, null, false, pos, configName);
          } else{
            if(clickToFilter){
            // var redraw = new HorizontalStackBarChart();
            // redraw.props = {configName: configName, defined_colors: definedColors, data: parent_data, x_label: x_label, y_label: y_label, x_axis: x_axis, legendContainer: legendContainer.slice(1), height: re_height, width: re_width,clickToFilter:clickToFilter,children:children,filterSource:filterSource }
            // redraw.drawChart();
          }}
        })
        .on('dblclick.zoom', null)
  
        d3.select(chartContainer).on('dblclick.zoom', null)
        d3.select(chartContainer).select('svg').on('dblclick.zoom', null)
        
        d3.select(chartContainer).select('svg').attr("viewBox", [0, 0, 975, 610]).call(d3.zoom().scaleExtent([1 / 2, 8]).on('zoom', zoomed)).on('dblclick.zoom', null);
        if (svg.select(".shapes").selectAll("path").size() === 0) {

            svg.selectAll("*").remove()
            svg.append("g")
                .attr('class', 'meta')
            svg.append("g")
                .attr('class', 'shapes')
        }

        var paths = svg.select(".shapes")
            .selectAll('path')
            .data(us)

        paths.exit().remove();

        paths.enter().append("path")

        //svg=svg.select('.shapes');
        svg.select('.shapes')
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .join("path")
            .attr("fill", d => { return color(data.get(d.id)) })
            .attr("d", path)
            .on("click", function (d) {
                if(!data.get(d.id)) return null
                if (clickToFilter) {
                  /* var selected_field = d.key;
                  var newArr = data.filter(function (e) {
                    return e[filterSource]==selected_field;
                });
                  var redraw = new HorizontalStackBarChart();
                  redraw.props = {configName: configName, defined_colors: definedColors, data: newArr, width: re_width, height: re_height, x_label: x_label, y_label: y_label, legendContainer: legendContainer.slice(1),clickToFilter:clickToFilter,children:children,filterSource:filterSource }
                  redraw.drawChart(); */
                }
                else if (Object.keys(children).length != 0) {
                  var childChart = children;
                  var selected_field=d[filterSource];
                  
                  if(ifClickChildren){
                    cu.onClickChangeChart(null, re_height, re_width, null, null, null, false, pos, configName);  
        
                  } else {
                    cu.onClickChangeChart(childChart, re_height, re_width, legendContainer.slice(1), children.filtertarget, selected_field,true,pos, configName);
        
                  }
        
                }
              })
            .on("mouseover", function (d, i, j) {
                cu.showCustomTooltip(this ,function () {
                  return `${d.properties.name},  ${states.get(d.id.slice(0, 2)).name}  ${format(hideTooltipBottomValue.localeCompare("no")==0? "":"\n"+data.get(d.id))}`;
                  });
                
              })
              .on("mousemove", function () {
                cu.moveCustomTooltip(this )
              })
              .on("mouseleave", function (d) { cu.hideCustomTooltip();})
            
        svg.select('.shapes').append("path")
            .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-linejoin", "round")
            .attr("d", path);



        function zoomed() {
            d3.select(chartContainer).select('svg').selectAll('.trans').on('dblclick', null).attr('transform', d3.event.transform)
        }


        if (referenceLineValue != undefined) { cu.addReferenceLine(svg.select('.shapes'), null, referenceLineValue, referenceLineColor, null, isNull); }
        else { svg.select(".shapes").selectAll('.regression').remove(); }
    }

    render() {
        return <div></div>
    }

}
export default ChoroplethChart;