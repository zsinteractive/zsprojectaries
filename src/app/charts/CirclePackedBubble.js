import React, { Component } from "react";
import * as d3 from "d3";
import * as cu from "./ChartUtils"
import { isNumber } from "underscore";

class CirclePackedBubble extends Component {

  componentDidMount() {
    this.drawChart()
  }
  componentDidUpdate() {
    this.drawChart()
  }

  drawChart() {
    const margin = /*this.props.margin*/{ top: 30, right: 30, bottom: 70, left: 130 };

    const data = this.props.data  // Data for the Chart
    const legendContainer = "#" + this.props.legendContainer;// Container ID for the Chart Legend
    const chartContainer = "#" + /*this.props.chartContainer*/"chart-container";//Conatianer ID for the Chart
    var width = this.props.width - margin.left - margin.right;// Calculated width for the SVG
    var height = this.props.height - margin.top - margin.bottom;// Calculated height for the SVG
    var re_width = 932, re_height = 932;
    
     //Assigning color scheme
     var color=cu.get_color([],false,this.props.defined_colors);
    //Initializes SVG element
    cu.init_svg(chartContainer, null, margin, width, height);
    d3.select(chartContainer).select('svg').select(".trans").selectAll(".x_axis, .y_axis, .x_lable, .y_lable").remove();
    d3.select(chartContainer).select('svg').select('.trans').attr("transform", "translate("+width/2+","+height*0.6+")")

    var svg = d3.select(chartContainer).select('svg').select(".chart")
    svg.select(".shapes").selectAll('text').remove()
    svg.select(".shapes").selectAll('path').remove()
    svg.select(".meta").selectAll("*").remove()//Clears the SVG Meta element


    if (svg.select(".shapes").selectAll("circle").size() === 0) {
      svg.selectAll("*").remove()
      svg.append("g")
      .attr('class', 'meta')
      svg.append("g")
      .attr('class', 'shapes')
      
    }
    var circles = svg.select(".shapes").selectAll("circle").data(data)

    circles.exit().remove() //Clears the circle element

    circles.enter().append("circle")

    const pack = data => d3.pack()
      .size([width, height])
      .padding(3)
      (d3.hierarchy(data)
        .sum(d => d.size)
        .sort((a, b) => b.size - a.size))


    const root = pack(data);
    let focus = root;
    let view;
    var metaSVG=svg.select('.shapes');

    svg.select('.meta').append('rect').attr('width', width).attr('height', height).style('opacity', 0)
      .on('dblclick', ()=>zoom(root))

    svg = svg.select(".shapes")
      .attr("viewBox", `100 100 ${width} ${height}`)
      .style("display", "block")
      .style("margin", "0 -14px")
      .style("background", color(0))
      .style("cursor", "pointer")
      .on("click", () => zoom(root));

    const node = svg
      .selectAll("circle")
      .attr('class','pack_circle')
      .data(root.descendants().slice(1))
      .join("circle")
      .attr("fill", d =>{ while (d.depth > 1) { d = d.parent; }return color(d.data.name);})
      //.attr("fill", d =>{  return d.children ? color(d.data.name) :color(d.data.name)})
      .style("opacity",d=> ((d.depth)*0.3)).attr("pointer-events", d => !d.children ? "none" : null)
      .on("mouseover", function () { d3.select(this).attr("stroke", "#000"); })
      .on("mouseout", function () { d3.select(this).attr("stroke", null); })
      .on("click", function(d) { 
        console.log(d)
        return focus !== d && (zoom(d), d3.event.stopPropagation())
      });

    const label = metaSVG.append("g")
      .style("font", "12px sans-serif")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .selectAll("text")
      .data(root.descendants())
      .join("text")
      .style("fill-opacity", d => d.parent === root ? 1 : 0)
      .style("display", d => d.parent === root ? "inline" : "none")
      .text(function (d) {return (d.data.name).length > 22? (d.data.name).slice(0,2) + '...':  d.data.name });

    zoomTo([root.x, root.y, root.r *2.95]);

    function zoomTo(v) {
      const k = (width / v[2]) + 0.3;
      view = v;
      //v[0]/=3;v[1]/=6;
      label.attr("transform", function (d) { return `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`});
      node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      node.attr("r", d => d.r * k);
    }

    function zoom(d) {
      const focus0 = focus;

      focus = d;

      const transition = svg.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", d => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 3]);
          return t => zoomTo(i(t));
        });

      label
        .filter(function (d) { return d.parent === focus || this.style.display === "inline"; })
        .transition(transition)
        .style("fill-opacity", d => d.parent === focus ? 1 : 0)
        .on("start", function (d) { if (d.parent === focus) this.style.display = "inline"; })
        .on("end", function (d) { if (d.parent !== focus) this.style.display = "none"; });
    }





  }

  render() {
    return <div></div>
  }

}

export default CirclePackedBubble;