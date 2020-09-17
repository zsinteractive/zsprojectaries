import React, { Component } from "react";
import * as d3 from "d3";
import  Sankey from "./sankey";
import {Button} from '@material-ui/core';
import './style.css';
import { red } from "@material-ui/core/colors";
import * as cu from "../ChartUtils";
var parent_data = {};

export default class SankeyChart extends Component {
    componentDidMount() {
        this.drawChart(this.props.dvar);
    }
    componentDidUpdate(){
        this.drawChart(this.props.dvar)
      }

    drawChart(data) {
        const global_color_scheme = /*this.props.color*/ d3.schemeSet2; //Color Scheme for the Chart
        const margin = /*this.props.margin*/{ top: 30, right: 30, bottom: 70, left: 130 }; // Object for the margins to the SVG
        const anim_dur = /*this.props.animation*/2000; //Duration time for any transition 
        const legendContainer = "#" + this.props.legendContainer; // Container ID for the Chart Legend
        const chartContainer = "#" + /*this.props.chartContainer*/"chart-container"; //Conatianer ID for the Chart
        var width = this.props.width - margin.left - margin.right; // Calculated width for the SVG
        var height = this.props.height - margin.top - margin.bottom; // Calculated height for the SVG
        const dvar = this.props.dvar;// Data for the Chart       
        var definedColors = this.props.defined_colors;  
        var configName = this.props.configName;      
        if(this.props.isParent){
            parent_data = this.props.dvar
          }
        var formatNumber = d3.format(",.0f"),
          format = function(d) {
            return formatNumber(d);
          },          
          color = cu.get_color(dvar.nodes.map(function(d){return d.name}), false, this.props.defined_colors) //Function to map the color scheme with data
        
        //Creating an instanse of Sankey Chart  
        var sankey = Sankey(width)
          .nodeWidth(15)
          .nodePadding(10)
          .size([width, height]);
        const energy = dvar
        
        //Binding Data with Chart
        sankey
        .nodes(energy.nodes)
        .links(energy.links)
        .layout(32);


        function setDash(d) {
        var d3this = d3.select(this);
        var totalLength = d3this.node().getTotalLength();
        d3this
            .attr('stroke-dasharray', totalLength + ' ' + totalLength)
            .attr('stroke-dashoffset', totalLength)
        }

        //Function to add the animation on nodes
        function branchAnimate(nodeData) {
        var links = svg.selectAll(".gradient-link")
            .filter(function(gradientD) {
            return nodeData.sourceLinks.indexOf(gradientD) > -1
            });
        var nextLayerNodeData = [];
        links.each(function(d) {
            nextLayerNodeData.push(d.target);
        });
        links
            .style("opacity", null)
            .transition()
            .duration(400)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0)
            .on("end", function() {
            nextLayerNodeData.forEach(function(d) {
                branchAnimate(d);
            });
            });
        } //end branchAnimate

        //Initializes SVG element
       
        cu.init_svg(chartContainer, null, margin, width, height) 
        cu.createCustomTooltip(chartContainer);
        d3.select(chartContainer).select('svg').select(".trans")
        .attr("transform", "translate(" + margin.right + "," + margin.top + ")")
        cu.hideAxes(chartContainer);

        var svg = d3.select(chartContainer).select('svg').select(".chart")
    
        svg.selectAll("*").remove()
        svg.append("g")
        .attr('class', 'meta')
        svg.append("g")
        .attr('class', 'shapes')

        //Creates Gradient Link for every node
        var gradientLink =  svg.select(".meta").append("g").selectAll(".gradient-link")
        .data(energy.links)
        .enter().append("path")
        .attr("class", "gradient-link")
        //.attr("d", path)
        .attr("d", d => {
            // Prevents exact horizontal sankey links from disappearing.
            // See for reference https://github.com/d3/d3-sankey/issues/28
            const rpath = sankey.link()(d);
            const match = rpath.match(/,([^C]+)C/);
    
            if (match.length !== 2) {
              return rpath;
            }
    
            const replacementValue = +match[1] + 0.01;
            const fixedPath = rpath.replace(match[1], '' + replacementValue);
    
            return fixedPath;
          })
        .style("stroke-width", function(d) {
            return Math.max(1, d.dy);
        })
        .sort(function(a, b) {
            return b.dy - a.dy;
        })
        
        var full_width = this.props.width;
        var full_height = this.props.height;
        svg.select('.meta')
        .on('dblclick', () => {
            var redraw = new SankeyChart();
            redraw.props = {configName: configName, defined_colors: definedColors, dvar:parent_data, x_label: "X Label", y_label: "Y Label", height: full_height, width:full_width, legendContainer:'legend_container'}
            redraw.drawChart()
        })
        //Adds transition for each gradient link
        gradientLink.transition().duration(anim_dur).ease(d3.easeBack)
        .each(setDash)
        .style('stroke', function(d) {
            var sourceColor = color(d.source.name.replace(/ .*/, "")).replace("#", "").replace("(","").replace(")","").replace(",","").replace(",","").replace(",","").replace(" ","").replace(" ","").replace(" ","").replace(" ","");
            var targetColor = color(d.target.name.replace(/ .*/, "")).replace("#", "").replace("(","").replace(")","").replace(",","").replace(",","").replace(",","").replace(" ","").replace(" ","").replace(" ","").replace(" ","");
            var id = 'c-' + sourceColor + '-to-' + targetColor;
            
            if (true) {
            //append the gradient def
            //append a gradient
            var gradient =  svg.select(".meta").append('defs')
                .append('linearGradient')
                .attr('id', id)
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '100%')
                .attr('y2', '0%')
                .attr('spreadMethod', 'pad');

            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', "#" + sourceColor)
                .attr('stop-opacity', 1);

            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', "#" + targetColor)
                .attr('stop-opacity', 1);
            }
            return "url(#" + id + ")";
        });

        
        var link =  svg.select(".meta").append("g").selectAll(".link")
        .data(energy.links)
        .enter().append("path")
        .attr("class", "link")
        //.attr("d", path) 
        .attr("d", d => {
            // Prevents exact horizontal sankey links from disappearing.
            // See for reference https://github.com/d3/d3-sankey/issues/28
            const rpath = sankey.link()(d);
            const match = rpath.match(/,([^C]+)C/);
    
            if (match.length !== 2) {
              return rpath;
            }
    
            const replacementValue = +match[1] + 0.01;
            const fixedPath = rpath.replace(match[1], '' + replacementValue);
    
            return fixedPath;
          })       
        .style("stroke-width", function(d) {
            return Math.max(1, d.dy);
        })
        .sort(function(a, b) {
            return b.dy - a.dy;
        });

        //Adds tooltip to nodes
        link
        .on("mouseover", function (d, i, j) {
            cu.showCustomTooltip(this ,function () {
              return d.source.name + " → " + d.target.name + "\n" + format(d.value);
              });
            
          })
          .on("mousemove", function () {
            cu.moveCustomTooltip(this )
          })
          .on("mouseleave", function (d) { cu.hideCustomTooltip();})
        // .append("title")
        // .text(function(d) {
        //     return d.source.name + " → " + d.target.name + "\n" + format(d.value);
        // });

        //Adding nodes to the Chart
        var node =  svg.select(".meta").append("g").selectAll(".node")
        .data(energy.nodes)
        .enter().append("g")
        .attr("class", "node")
        .on("mouseover", function (d, i, j) {
            cu.showCustomTooltip(this ,function () {
              return d.name + "\n" + format(d.value);
              });
            branchAnimate(d);
          })
        .on("mousemove", function () {
            cu.moveCustomTooltip(this )
          })
        .on("mouseleave", function (d) { cu.hideCustomTooltip();})
        .on("mouseout", function() {
            //cancel all transitions by making a new one
            gradientLink.transition();
            gradientLink
            .style("opacity", 0)
            .each(function(d) {
                //setDash.call(this, d);
            });
        })
        // Filter Chart on Click to any node
        var filteredTest={};
        var newnodes=[];
        var newNode= svg.selectAll(".node") 
        .data(energy.nodes) 
        .on("click",function(clickedElement){
            filteredTest.nodes=[];
            filteredTest.links=[];
            var allHeads=[];
            var redraw=new SankeyChart();

            newnodes.push({"name":clickedElement.name,"source":clickedElement.source});
            linking(clickedElement.source);
            //allHeads=[... new Set(newnodes.map(data => data))];
            
            allHeads = newnodes.reduce((acc, current) => {
                const x = acc.find(item => item.source === current.source);
                if (!x) {
                  return acc.concat([current]);
                } else {
                  return acc;
                }
              }, []);
            filteredTest['nodes']=allHeads;

            var temper=formatJSONData(filteredTest)
            if(temper.links.length === 0 ) return null;
            redraw.props={configName: configName, width:full_width,height:full_height, dvar:temper, defined_colors: definedColors};
            redraw.drawChart();     
           }) 
        
        //function to format the filtered JSON   
        function formatJSONData(data){
            var nodes = data["nodes"]
            var links = data["links"]
            for(var i=0;i<links.length;i++){
                var link = links[i];
                links[i] = {"source":nodes.findIndex(x => x.source ===link['source']), "target":nodes.findIndex(x => x.source ===link['target']), "value":link["value"]}
            }
            /* for(var i=0;i<nodes.length;i++){
                nodes[i] = {"name":nodes[i]}
            } */
            return {"nodes":nodes, "links":links}
        }
        //Function to Link the Filtered Data with target
        function linking(sourceName){
                var filteredValues=energy.links.filter(function (p) {
                
                    return p.source.source == sourceName;
                  });
                  filteredValues.forEach(i=>{
                    if(i.target.source!=null)
                    {
                      newnodes.push({"name":i.target.name,"source":i.target.source});
                       linking(i.target.source)
                    }
                    filteredTest.links.push({"source":i.source.source,"target":i.target.source,"value":i.value});
                  })
        }// Click filter ends here

        node
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });


        node.append("rect")
        .attr("height", function(d) {
            return d.dy;
        })
        .attr("width", sankey.nodeWidth())
        node
        .style("fill", function(d) {
            return d.color = color(d.name.replace(/ .*/, ""));
        })
        // .append("title")
        // .text(function(d) {
        //     return d.name + "\n" + format(d.value);
        // })
        // .on('click', function(){
        // })

        node.append("text")
        .attr("x", -6)
        .attr("y", function(d) {
            return d.dy / 2;
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) {
            return d.name;
        })
        .filter(function(d) {
            return d.x < width / 2;
        })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");        
        
        d3.select('#legend_container').selectAll('svg').remove();
    }

    render() {
        return <div style={{width: '100%', bottom: 0, left:0, marginTop: '1%', marginLeft: '6%'}}>
            {/* <Button variant = 'contained' color='primary' onClick={()=>this.drawChart(this.props.dvar)}>Reset</Button> */}
        </div>
    }

}