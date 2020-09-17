import React, { Component } from "react";
import * as d3 from "d3";
import * as cu from "./ChartUtils"
import { isNumber } from "underscore";


class NetworkChart extends Component {

  componentDidMount() {
    this.drawChart()
  }
  componentDidUpdate() {
    this.drawChart()
  }

  drawChart() {

    const margin = /*this.props.margin*/{ top: 130, right: 30, bottom: 70, left: 130 };
    const data = this.props.data[0]  // Data for the Chart
    const legendContainer = "#" + this.props.legendContainer;// Container ID for the Chart Legend
    const chartContainer = "#" + /*this.props.chartContainer*/"chart-container";//Conatianer ID for the Chart
    var width = this.props.width - margin.left - margin.right;// Calculated width for the SVG
    var height = this.props.height - margin.top - margin.bottom;// Calculated height for the SVG
    const transform = d3.zoomIdentity;
    var groups = data.nodes.map(d => { return d.color });    groups = [...new Set(groups)];
groups=groups.map(String);
    cu.init_svg(chartContainer, legendContainer, margin, width, height);
    cu.hideAxes(chartContainer);
    d3.select(chartContainer).select('svg').attr("viewBox", [0, 0, width, height]).call(d3.zoom().scaleExtent([1/2, 8]).on('zoom', zoomed));
    var svg = d3.select(chartContainer).select('svg').select('.chart');

    d3.select(chartContainer).select('svg').select('.trans').attr("transform", "translate(" + margin.left/4 + "," + margin.top/3 + ")")
    /* const color =(d)=> {
      const scale = d3.scaleOrdinal(d3.schemeCategory10).domain([0,1,2,3,4,5,6,7,8,9,10]);
      return  scale(d.color);
    }  */
    var color = cu.get_color(groups, false, this.props.defined_colors);
    cu.createCustomTooltip(chartContainer);
    cu.show_legend(legendContainer,groups,color)
    svg.selectAll("*").remove()
    svg.append("g")
      .attr('class', 'meta')
    svg.append("g")
      .attr('class', 'shapes')

      const links = data.links.map(d => Object.create(d));
      const nodes = data.nodes.map(d => Object.create(d));

      const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.name))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));


      const link = svg.select('.meta').append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value));

      const node = svg.select('.meta').append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
      .attr("r", 5)
      .attr("class", function (d) { return "category _" + d.color })
      .attr("fill", function (d) { return color(d.color); })
      .call(drag(simulation));

      // node.append("title")
      // .text(d => d.name);

      node.on("mouseover", function (d, i, j) {
        cu.showCustomTooltip(this,function () {
          return d.name;
          });
        
      })
      .on("mousemove", function () {
        cu.moveCustomTooltip(this)
      })
      .on("mouseleave", function (d) { cu.hideCustomTooltip();})


  simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
  });


  
function zoomed() {
  d3.select(chartContainer).select('svg').selectAll('.trans').attr('transform', d3.event.transform)
}

  function drag(simulation) {
  
    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
    
    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
  }

  }

  render() {
    return <div></div>
  }

}

export default NetworkChart;