import React, { Component } from "react";
import * as d3 from "d3";
import * as cu from "./ChartUtils"
import { isNumber } from "underscore";

class TreeChart extends Component {

  componentDidMount() {
    this.drawChart()
  }
  componentDidUpdate() {
    this.drawChart()
  }

  drawChart() {
    const margin = /*this.props.margin*/{ top: 130, right: 30, bottom: 70, left: 130 };
    const data = this.props.data // Data for the Chart
    const legendContainer = "#" + this.props.legendContainer;// Container ID for the Chart Legend
    const chartContainer = "#" + /*this.props.chartContainer*/"chart-container";//Conatianer ID for the Chart
    var width = this.props.width - margin.left - margin.right;// Calculated width for the SVG
    var height = this.props.height - margin.top - margin.bottom;// Calculated height for the SVG
    var re_width = 932, re_height = 932;
    const root = d3.hierarchy(data[0]);
    const transform = d3.zoomIdentity;
    let node, link; let i = 0;

    cu.init_svg(chartContainer, null, margin, width, height);
    cu.hideAxes(chartContainer);
    cu.createCustomTooltip(chartContainer)
    d3.select(chartContainer).select('svg').select('.trans').attr("transform", "translate(" + margin.left + "," + margin.top*2 + ")")
    var svg = d3.select(chartContainer).select('svg').select('.chart');


    svg.selectAll("*").remove()
    svg.append("g")
      .attr('class', 'meta')
    svg.append("g")
      .attr('class', 'shapes')

    svg = svg.select('.meta');
    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(function (d) { return d.id; }))
      .force('charge', d3.forceManyBody().strength(-15).distanceMax(300))
      .force('center', d3.forceCenter(width / 2, height / 4))
      .on('tick', ticked)



    function update() {
      const nodes = flatten(root)
      const links = root.links()

      link = svg
        .selectAll('.link')
        .data(links, function (d) { return d.target.id })

      link.exit().remove()

      const linkEnter = link
        .enter()
        .append('line')
        .attr('class', 'link')
        .style('stroke', '#000')
        .style('opacity', '0.7')
        .style('stroke-width', 4)

      link = linkEnter.merge(link)

      node = svg
        .selectAll('.node')
        .data(nodes, function (d) { return d.id })

      node.exit().remove()

      const nodeEnter = node
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('stroke', '#666')
        .attr('stroke-width', 2)
        .style('fill', color)
        .style('opacity', 1)
        .on('click', clicked)
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended))

      nodeEnter.append('circle')
        .attr("r", function (d) { return Math.sqrt(d.data.size)/3 || 4.5; })
        .style('text-anchor', function (d) { return d.children ? 'end' : 'start'; })
        .on("mouseover", function (d, i, j) {
          cu.showCustomTooltip(this,function () {
            return d.data.name;
            });
        })
        .on("mousemove", function () {
          cu.moveCustomTooltip(this)
        })
        .on("mouseleave", function (d) { cu.hideCustomTooltip() })
        // .append("title")
        // .text(function (d) { return d.data.name })

      node = nodeEnter.merge(node)
      simulation.nodes(nodes)
      simulation.force('link').links(links)
    }

    function ticked() {
      link
        .attr('x1', function (d) { return d.source.x; })
        .attr('y1', function (d) { return d.source.y; })
        .attr('x2', function (d) { return d.target.x; })
        .attr('y2', function (d) { return d.target.y; })

      node
        .attr('transform', function (d) { return `translate(${d.x}, ${d.y})` })
    }
    function color(d) {
      return d._children ? "#51A1DC" // collapsed package
        : d.children ? "#51A1DC" // expanded package
          : "#F94B4C"; // leaf node
    }

    function radius(d) {
      return d._children ? 8
        : d.children ? 8
          : 4
    }

    function sizeContain(num) {
      num = num > 1000 ? num / 1000 : num / 100
      if (num < 4) num = 4
      return num
    }

    // Toggle children on click.
    function clicked(d) {
      if (!d3.event.defaultPrevented) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update()
      }
    }
    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }
    function dragged(d) {
      d.fx = d3.event.x
      d.fy = d3.event.y
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    // Returns a list of all nodes under the root.
    function flatten(root) {
      const nodes = []
      function recurse(node) {
        if (node.children) node.children.forEach(recurse)
        if (!node.id) node.id = ++i;
        else ++i;
        nodes.push(node)
      }
      recurse(root)
      return nodes
    }

    update();

  }

  render() {
    return <div></div>
  }

}

export default TreeChart;