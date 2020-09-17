import React, { Component } from "react";
import * as d3 from "d3";
import * as cu from "./ChartUtils"
import { lab } from "d3";

export default class SunBurst extends Component {
  componentDidMount() {
    this.drawChart();
  }

  componentDidUpdate() {
    this.drawChart()
  }
  drawChart() {
    const globalColorScheme = /*this.props.color*/ d3.schemeSet2;
    const margin = /*this.props.margin*/{ top: 10, right: 30, bottom: 30, left: 130 };
    const anim_dur = this.props.animation;

    const data = this.props.data
    var width = this.props.width - margin.left - margin.right;
    var height = this.props.height - margin.top - margin.bottom;
    const legendContainer = "#" + this.props.legendContainer;
    const chartContainer = "#" + /*this.props.chartContainer*/"chart-container";

    const format = d3.format(",d");
    const radius = width / 7;


    var partition = data => {
      const root = d3.hierarchy(data)
        .sum(d => d.size)
        .sort((a, b) => b.value - a.value);
      return d3.partition()
        .size([2 * Math.PI, root.height + 1])
        (root);
    };

    const arc = d3.arc()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius(d => d.y0 * radius)
      .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

    const root = partition(data);

    const color = cu.get_color(root, false, this.props.defined_colors);

    root.each(d => d.current = d);
    
    var ini = cu.init_svg(chartContainer, null, margin, width, height)
    cu.createCustomTooltip(chartContainer)
    d3.select(chartContainer).select('svg').select(".trans")
      .attr("transform", "translate(" + width * 0.5 + "," + height * 0.5 + ")")

      cu.hideAxes(chartContainer);

    var svg = d3.select(chartContainer).select('svg').select(".chart")

    svg.selectAll("*").remove()
    svg.append("g")
      .attr('class', 'meta')
    svg.append("g")
      .attr('class', 'shapes')

    const path = svg.select(".meta")
      .selectAll("path")
      .data(root.descendants().slice(1))
      .join("path") 
      .attr("fill", d => {
        while (d.depth > 1) { d = d.parent; }
        return color(d.data.name);
      })
      .attr("fill-opacity", d => arcVisible(d.current) ? (1-(d.depth)*0.2): 0);

    path.each(function(d){tooltipEnableDisable(d,"current",this)})  
   

    path.filter(d => d.children)
      .style("cursor", "pointer")
      .on("click", clicked);

   /*  cu.tooltip(path, function (res, that) {
      return `${res.ancestors().map(res => res.data.name).slice(0, -1).reverse().join("/")}\nValue:${format(res.value)}`;
    }) */
    var group_length = path._groups[0].length;
    var i_dur = anim_dur / group_length < 50 ? 20 : i_dur;
    path.transition().duration(anim_dur).delay((d, i) => { return i * i_dur })
      .attr("d", d => arc(d.current));

    const label = svg.select(".meta").append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(1))
      .join("text")
      .attr("fill-opacity", d => +labelVisible(d.current))
      .attr("transform", d => labelTransform(d.current))
      .text(d => d.data.name)
      .attr("dy", "0.3838464em")

    const parent = svg.select(".meta")
      .append("circle")
      .datum(root)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("dblclick", clicked);

    function clicked(p) {
      parent.datum(p.parent || root);

      root.each(d => d.target = {
        x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        y0: Math.max(0, d.y0 - p.depth),
        y1: Math.max(0, d.y1 - p.depth)
      });
      const t = svg.transition().duration(anim_dur);
      // Transition the data on all arcs, even the ones that aren’t visible,
      // so that if this transition is interrupted, entering arcs will start
      // the next transition from the desired position.
      path.transition(t)
        .tween("data", d => {
          const i = d3.interpolate(d.current, d.target);
          return t => d.current = i(t);
        })
        .filter(function (d) {
          return +this.getAttribute("fill-opacity") || arcVisible(d.target);
        })
        .attr("fill-opacity", d => arcVisible(d.target) ? (1-(d.depth)*0.2) : 0)
        .attrTween("d", d => () => arc(d.current));


        path.each(function(d){tooltipEnableDisable(d,"target",this)})  

      label.filter(function (d) {
        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
      }).transition(t)
        .attr("fill-opacity", d => +labelVisible(d.target))
        .attrTween("transform", d => () => labelTransform(d.current));
    }

    function tooltipEnableDisable(ele,node,that){
      var header=d3.select(that)
      if(arcVisible(ele[node])){
        header.on("mouseover", function (d, i, j) {
          cu.showCustomTooltip(this,function () {
            return `${d.ancestors().map(d => d.data.name).slice(0, -1).reverse().join("/")}\nValue:${format(d.value)}`;
            });
        })
        .on("mousemove", function () {
          cu.moveCustomTooltip(this)
        })
        .on("mouseleave", function (d) { cu.hideCustomTooltip();})
      } 
      else{
        header.on("mouseover",null).on("mousemove",null).on("mouseleave",null)
      }

    }

    function arcVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
      const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      const y = (d.y0 + d.y1) / 2 * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

  }

  render() {
    return <div></div>
  }
}