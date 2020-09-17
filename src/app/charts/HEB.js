import React, { Component } from "react";
import * as d3 from "d3";
import * as cu from "./ChartUtils";
// import testdata from '../mock_data/flare.json'

var globalColorScheme = d3.schemeSet2;
var parent_data = {};
var parent_width;
var parent_height;


class HEB extends Component {

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
        if (this.props.isParent) {
            parent_data = this.props.data
        }
        //console.log(testdata);
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
        var secondAxis = 1/* this.props.secondAxis */;
        var configName = this.props.configName;
        const colorin = "#32A29B", colorout = "#EC7200", colornone = "#ccc", radius = width / 2;
        var color=cu.get_color([],false,this.props.defined_colors)
        var re_width=width;
        width= 854;
        
        var line = d3.lineRadial()
            .curve(d3.curveBundle.beta(0.85))
            .radius(d => d.y)
            .angle(d => d.x)

        var tree = d3.cluster()
            .size([2 * Math.PI, radius - 100])

        const root = tree(bilink(d3.hierarchy(data).sort((a, b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.name, b.data.name))));

            cu.init_svg(chartContainer, null, margin, re_width, height);
            cu.hideAxes(chartContainer);
          var initSvg = d3.select(chartContainer).select("svg").attr("viewBox", [-width / 2, -width / 2, width, width]).select('.chart');
          d3.select(chartContainer).select('svg').select('.trans').attr("transform", "translate(0,0)");


          initSvg.selectAll("*").remove()
          initSvg.append("g")
      .attr('class', 'meta')
      initSvg.append("g")
      .attr('class', 'shapes')

        var svg = d3.select(chartContainer).select('svg').select('.chart').select('.meta');


        const node = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .selectAll("g")
            .data(root.leaves())
            .join("g")
            .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
            .append("text")
            .attr("dy", "0.31em")
            .attr("x", d => d.x < Math.PI ? 6 : -6)
            .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
            .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
            .text(d => d.data.name)
            .each(function (d) { d.text = this; })
            .attr('fill',d => color(d.data.name))
            .style('font-size','15px')
            .on("mouseover", overed)
            .on("mouseout", outed)
//             .call(text => text.append("title").text(d => `${id(d)}
// ${d.outgoing.length} outgoing
// ${d.incoming.length} incoming`));

        const link = svg.append("g")
            .attr("stroke", colornone)
            .attr("fill", "none")
            .selectAll("path")
            .data(root.leaves().flatMap(leaf => leaf.outgoing))
            .join("path")
            .style("mix-blend-mode", "multiply")
            .attr("d", ([i, o]) => line(i.path(o)))
            .each(function (d) { d.path = this; });

            /* var groupData = svg.selectAll(".group")
            .data(node.filter(function (d) { return (d.key == 'Jobs' || d.key == 'Freelance' || d.key == 'Bayard') && d.children; }))
            .enter().append("group")
            .attr("class", "group");

        var groupArc = d3.arc()
            .innerRadius(width/2 - 177)
            .outerRadius(width/2 - 157)
            .startAngle(function (d) { return (findStartAngle(d.__data__.children) - 2) *Math.PI / 180; })
            .endAngle(function (d) { return (findEndAngle(d.__data__.children) + 2) * Math.PI / 180 });

        svg.selectAll(".arc")
            .data(groupData[0])
            .enter().append("path")
            .attr("d", groupArc)
            .attr("class", "groupArc")
            .style("fill", "#1f77b4")
            .style("fill-opacity", 0.5); */


            function findStartAngle(children) {
                var min = children[0].x;
                children.forEach(function(d) {
                   if (d.x < min)
                       min = d.x;
                });
                return min;
            }
            function findEndAngle(children) {
                var max = children[0].x;
                children.forEach(function(d) {
                   if (d.x > max)
                       max = d.x;
                });
                return max;
            }
        function overed( d) {
            link.style("mix-blend-mode", null);
            d3.select(this).attr("font-weight", "bold");
            d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", colorin).raise();
            d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", colorin).attr("font-weight", "bold");
            d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", colorout).raise();
            d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", colorout).attr("font-weight", "bold");
        }

        function outed( d) {
            link.style("mix-blend-mode", "multiply");
            d3.select(this).attr("font-weight", null);
            d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", null);
            d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", d=>color(d.data.name)).attr("font-weight", null);
            d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", null);
            d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill",d=>color(d.data.name)).attr("font-weight", null);
        }

        function hierarchy(data, delimiter = ".") {
            let root;
            const map = new Map;
            data.forEach(function find(data) {
                const { name } = data;
                if (map.has(name)) return map.get(name);
                const i = name.lastIndexOf(delimiter);
                map.set(name, data);
                if (i >= 0) {
                    find({ name: name.substring(0, i), children: [] }).children.push(data);
                    data.name = name.substring(i + 1);
                } else {
                    root = data;
                }
                return data;
            });
            return root;
        }

        function bilink(root) {
            const map = new Map(root.leaves().map(d => [id(d), d]));
            for (var d of root.leaves()) { 
                d.incoming = [];
                d.outgoing = d.data.imports.map(i => [d, map.get(i)]);
             }
            for (const d of root.leaves()) {
                for (const o of d.outgoing) {
                    o[1].incoming.push(o);
                   
                }
            }
            return root;
        }

        function id(node) {
            return `${node.parent ? id(node.parent) + "." : ""}${node.data.name}`;
        }
    }

    render() {
        return <div></div>
    }
}

export default HEB;