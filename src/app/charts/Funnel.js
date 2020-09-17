import React, { Component } from "react";
import * as d3 from "d3";
import D3Funnel from 'd3-funnel';


export default class Funnel extends Component {
    componentDidMount() {
        this.drawChart()
    }

    componentDidUpdate(){
        this.drawChart()
      }
      
    drawChart() {
        const data = this.props.data;
        const margin = {top: 10, right: 30, bottom: 20, left: 100};
        var width = this.props.width - margin.left - margin.right;
        var height = this.props.height - margin.top - margin.bottom;       
        const anim_dur = this.props.animation;  

        var svg = d3.select('#Funnel').select('svg')

        if (svg.select('.chart').selectAll('path').size() === 0) {
            svg.select('.chart').selectAll('*').remove()
        }

        svg.select('.trans').selectAll('*').remove()

        if (svg.selectAll('.chart').size() === 0) {
            svg.select('.trans').append("g")
                .attr('class', 'chart')
        }

        svg
            .attr("width", width)
            .attr("height", height) 
            .select(".trans") 
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); 

        
        const options = {
            block: {
                dynamicHeight: true,
                minHeight: 15
            },
            chart: {
                width: width,
                height: height,
                bottomWidth: 1 / 3,
                bottomPinch: 2,
                inverted: false,
                horizontal: false,
                animate: 500,
                curve: {
                    enabled: true,
                    height: 50,
                    shade: -1,
                },
                totalCount: null,
            },
            label:{
                enabled:true
            },
            tooltip: {
                enabled: true
            }
        };

        const chart = new D3Funnel('#Funnel');
        chart.draw(data, options);

        var legendContainer = "#" + this.props.legendContainer;
        d3.select(legendContainer).selectAll("*").remove();

    //   var svg_legend = d3.select(legendContainer)
    //       .append("svg")
    //       .attr("width", "100%")
    //       .attr("height", '95%')

    }

    render() {
        return <div id ='Funnel' ></div>
    }

}
