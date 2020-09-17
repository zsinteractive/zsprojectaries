import * as d3 from "d3";
import { isNumber } from "underscore";
import * as Chart from './index';
import GetApiData from './../utils/getApiData';
import $ from 'jquery';


export const init_svg = (container, legendContainer, margin, width, height) => {
  if (d3.select(container).selectAll('svg').size() === 0) {
    d3.select(container)
      .append("svg")
      .append("g")
      .attr("class", "trans")
  }
  d3.select(container).selectAll('.new_tooltip').style('opacity', 0);
  d3.select(container).selectAll('svg').attr('viewBox', null).on('.zoom', null);
  init_xaxis(".trans");
  init_yaxis(".trans");
  init_chart(".trans");
  d3.selectAll('.new_tooltip').style('opacity',0)

  d3.select(legendContainer)
    .selectAll("*").remove()
    .style('opacity', 0);

  if (d3.select(legendContainer).selectAll('*').size() == 0) {
    d3.select(legendContainer)
      .append("svg")
      .attr("width", "auto")
  }

  d3.select(container).select('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .select(".trans")
    .selectAll(".x_axis, .x_lable, .y_axis, .y_lable")
    .style('opacity', 1);


}

export const init_xaxis = (container) => {
  if (d3.select(container).selectAll('.x_axis').size() === 0) {
    d3.select(container)
      .append("g")
      .attr('class', 'x_axis')
  }
  if (d3.select(container).selectAll('.x_lable').size() === 0) {
    d3.select(container)
      .append("text")
      .attr('class', 'x_lable')
  }
  d3.select(container).selectAll(".x_axis, .x_lable").style('opacity', 1)

}




export const init_yaxis = (container) => {
  if (d3.select(container).selectAll('.y_axis').size() === 0) {
    d3.select(container)
      .append("g")
      .attr('class', 'y_axis')
      d3.select(container)
      .append("g")
      .attr('class', 'y_axis2')

  }
  if (d3.select(container).selectAll('.y_lable').size() === 0) {
    d3.select(container)
      .append("text")
      .attr('class', 'y_lable')
      d3.select(container)
      .append("text")
      .attr('class', 'y_lable2')
  }
  d3.select(container).selectAll('.y_axis2,.y_lable2').style('opacity',0)
  d3.select(container).selectAll(".y_axis, .y_lable .y_axis2  .y_lable2").style('opacity', 0)

}



export const init_chart = (container) => {
  if (d3.select(container).selectAll('.chart').size() === 0) {
    d3.select(container)
      .append("g")
      .attr('class', 'chart')

      .append("g")
      .attr('class', 'meta')
    d3.select(container).select(".chart")
      .append("g")
      .attr('class', 'shapes')
  }
}

export const show_x = (container, height, width, data, label, margin, anim_dur = 1000, anim = d3.easeBack, customFormat = undefined, isLine = false) => {
  var bandFlag = isNumber(data[0]), min_data, max_data;
  var arrayLen = 0, longest = 0;
  var reduceTick = false;
  d3.select(container).select("svg").select(".x_lable").text('')
  if (width < 250) {
    reduceTick = true;
  }
  if (customFormat === "time") {
    var newDate = [];

    data.forEach(element => {
      newDate.push(new Date(element))
    });
    var x = d3.scaleTime()
      .domain(d3.extent(data))
      .range([0, width]);

  }
  else if (bandFlag) {
    if (data[0] < 0) min_data = 1.08 * data[0]
    else min_data = 0.08 * data[0]
    max_data = 1.02 * data[1]
    data = [min_data, max_data]
    //data = [data[0] * 0.08, data[1] * 1.02]
    var x = d3.scaleLinear()
      .domain(data)
      .nice()
      .range([0, width]);
  }
  else {
    if (data.length != 0) {
      longest = data.reduce(function (a, b) { return a.length > b.length ? a : b; }).length;
      arrayLen = data.length;
    }
    var x = (isLine ? d3.scalePoint() : d3.scaleBand()).domain(data)
      .range([0, width])
      .padding(0.1)

  }
/*   var val;
  if (bandFlag) {
    if (customFormat == "time") {
      val = d3.axisBottom(x).ticks().tickSizeOuter(0).tickFormat(d3.timeFormat('%b %d'))
    }
    else {
      val = d3.axisBottom(x).ticks(reduceTick ? 2 : null).tickSizeOuter(0).tickFormat(
        (customFormat != undefined && customFormat != "time") ? (d3.format(customFormat)) :
          function (d) {
            if (d < 1 && d > -1) return d; else return d3.format("~s")(d);

          })
    }

  }
  else {
    val = d3.axisBottom(x).tickSizeOuter(0).tickFormat(
      function (d) {
        var str = d + ''
        if (str.length > 12) return str.slice(0, 10) + '...'
        else return str
      }).tickValues(reduceTick ? [] : data)
  }
 */
  var svg = d3.select(container).select("svg").select(".trans");
  svg.select(".x_axis")
    .transition().duration(0)
    .attr("font-size", "13px")
    .attr('font-family', "Arial")
    .attr("transform", "translate(0," + height + ")").ease(d3.easeBack)
    .style('opacity', 1)
    .call(xAxisTickFormat(x,bandFlag,customFormat,data,reduceTick))
  // .selectAll("text")	
  // .style("text-anchor", "end")
  // .attr("dx", "-.8em")
  // .attr("dy", ".15em")

  /* .call(bandFlag ? (customFormat==="time"? d3.axisBottom(x): d3.axisBottom(x).ticks(reduceTick ? 2 : null).tickSizeOuter(0).tickFormat(
    (customFormat != undefined&& customFormat!="time") ? ( d3.format(customFormat)) :
      function (d) {
        if (d < 1 && d > -1) return d; else return d3.format("~s")(d);

      })) : d3.axisBottom(x).tickSizeOuter(0).tickFormat(function (d) {
        var str = d + ''
        if (str.length > 12) return str.slice(0, 10) + '...'
        else return str
      }).tickValues(reduceTick ? [] : data)) */

  if (arrayLen > 10 && longest > 7) {
    svg.select(".x_axis").selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(45)")
      .style("text-anchor", "start");
  }

  if (arrayLen <= 10 || longest <= 7) {
    svg.select(".x_lable")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height)
      .attr("font-size", "14px")
      .attr("dy", "2.5em")
      .style('opacity', 1)
      .text(label)
  }
  return [svg.select('.x_axis'), x];

}

export const xAxisTickFormat=(x,bandFlag,customFormat,data,reduceTick=false)=>{

  var val;
  if (bandFlag) {
    if (customFormat == "time") {
      val = d3.axisBottom(x).ticks().tickSizeOuter(0).tickFormat(d3.timeFormat('%b %d'))
    }
    else {
      val = d3.axisBottom(x).ticks(reduceTick ? 2 : null).tickSizeOuter(0).tickFormat(
        (customFormat != undefined && customFormat != "time") ? (d3.format(customFormat)) :
          function (d) {
            if (d < 1 && d > -1) return d; else return d3.format("~s")(d);

          })
    }

  }
  else {
    val = d3.axisBottom(x).tickSizeOuter(0).tickFormat(
      function (d) {
        var str = d + ''
        if (str.length > 12) return str.slice(0, 10) + '...'
        else return str
      }).tickValues(reduceTick ? [] : data)
  }
return val;

}

export const calculateLeftMargin = (data) => {
  var bandFlag = isNumber(data[0]), min_data, max_data;
  var maxCharLength = 0;
  var leftMargin;
  if (bandFlag) {
    leftMargin = 5 * 10 + 25
  } else {
    data.map(str => {
      str = str + "";
      if (str.length > maxCharLength) maxCharLength = str.length
    })
    leftMargin = maxCharLength * 8 + 25;
  }

  return leftMargin;
}

export const show_y = (container, height, data, label, margin, anim_dur = 1000, anim = d3.easeBack, customFormat = undefined) => {
  var bandFlag = isNumber(data[0]), min_data, max_data;
  var maxCharLength = 0;
  var leftMargin;
  if (bandFlag) {
    if (data[0] < 0) min_data = 1.08 * data[0]
    else min_data = 0.08 * data[0]
    max_data = 1.02 * data[1]
    data = [min_data, max_data]
    // data = [data[0] * 0.08, data[1] * 1.02]
    var y = d3.scaleLinear()
      .domain(data)
      .nice()
      .range([height, 0]);

    leftMargin = 5 * 10 + 25
  }
  else {
    var y = d3.scaleBand()
      .domain(data)
      .range([0, height])
      .padding([0.2])
    leftMargin = calculateLeftMargin(data)
  }



  var svg = d3.select(container).select("svg").select(".trans");
  svg.selectAll(".y_axis")
    .transition().duration(anim_dur)
    .attr("font-size", "14px")
    .attr("font-family", "Arial")
    .style('opacity', 1)
    .call(bandFlag ? d3.axisLeft(y).tickFormat(
      customFormat != undefined ? d3.format(customFormat) :
        function (d) {
          if (d < 1 && d > -1) return d; else return d3.format("~s")(d);
        }) : d3.axisLeft(y));

  svg.select(".y_lable")
    .attr("x", -height / 2)
    .attr("y", -leftMargin)
    .text(label)
    .attr("dy", "1em")
    .attr("font-size", "14px")
    .attr("font-family", "Arial")
    .attr("text-anchor", "middle")
    .attr("transform", `rotate(-90)`)
    .style('opacity', 1);
  // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")



  d3.select('#chart-container').select('svg').select('.trans').attr("transform", "translate(" + leftMargin + "," + margin.top + ")")
  document.getElementById('interactivity_plus_legend').style.paddingLeft = (leftMargin - 11) + 'px';
  return [svg.select('.y_axis'), y];
}


export const show_second_axis=(container, height,width, data, label, margin, anim_dur = 1000, anim = d3.easeBack, customFormat = undefined)=>{
  var bandFlag = isNumber(data[0]), min_data, max_data;
  var maxCharLength = 0;
  var leftMargin;
  if (bandFlag) {
    if (data[0] < 0) min_data = 1.08 * data[0]
    else min_data = 0.08 * data[0]
    max_data = 1.02 * data[1]
    data = [min_data, max_data]
    // data = [data[0] * 0.08, data[1] * 1.02]
    var y = d3.scaleLinear()
      .domain(data)
      .nice()
      .range([height, 0]);

    leftMargin = 5 * 10 + 25
  }
  else {
    var y = d3.scaleBand()
      .domain(data)
      .range([0, height])
      .padding([0.2])
    leftMargin = calculateLeftMargin(data)
  }

  var svg = d3.select(container).select("svg").select(".trans");
  svg.selectAll(".y_axis2")
    .transition().duration(anim_dur)
    .attr("font-size", "14px")
    .attr("transform", "translate( " + width + ", 0 )")
    .attr("font-family", "Arial")
    .style('opacity', 1)
    .call(bandFlag ? d3.axisRight(y).tickFormat(
      customFormat != undefined ? d3.format(customFormat) :
        function (d) {
          if (d < 1 && d > -1) return d; else return d3.format("~s")(d);
        }) : d3.axisLeft(y));

        svg.select(".y_lable2")
        .attr("x", -height / 2)
        .attr("y", width+margin.right-20)
        .text(label)
        .attr("dy", "1em")
        .attr("font-size", "14px")
        .attr("font-family", "Arial")
        .attr("text-anchor", "middle")
        .attr("transform", `rotate(-90)`)
        .style('opacity', 1);

        return [svg.select('.y_axis2'), y];

}


export const formatNumber = (d, formatType = undefined) => {

  if (typeof d == "string") {
    return d;
  }
  else {
    if (formatType != undefined && formatType != "time") {
      return d3.format(formatType)(d)
    }
    else {
      if (d < 1 && d > -1)
        return d;
      else{
        if(d<1000) return d
        return d3.formatPrefix(".2", d)(d)
      }

        


    }
  }
}


export const show_legend = (legendContainer, data, color_scale, is_hori = false, is_cont = false,opacity=null) => {
  var svg = d3.select(legendContainer).select("svg")
  svg.selectAll("*").remove()
  // debugger
  if(data.length === 1) {
    d3.select(legendContainer).selectAll("*").remove()
    return null
  }
  data = data.sort();
  if (is_cont) {
    var legendheight = 250,
      legendwidth = 90,
      margin = { top: 10, right: 60, bottom: 10, left: 2 };

    var canvas = d3.select(legendContainer)
      // .style("height", legendheight + "px")
      // .style("width", legendwidth + "px")
      .style('overflow', '')
      .style("position", "relative")
      .append("canvas")
      .attr("height", legendheight - margin.top - margin.bottom)
      .attr("width", 1)
      .style("transform", is_hori ? `translateY(-54%) rotate(-90deg)` : `rotate(0deg)`)
      .style("height", (legendheight - margin.top - margin.bottom) + "px")
      .style("width", (legendwidth - margin.left - margin.right) + "px")
      .style("border", "1px solid #000")
      .style("position", "absolute")
      // .style("top", (margin.top) + "px")
      .style("left", (is_hori ? legendwidth + margin.top + margin.bottom : margin.left) + "px")
      .node();

    var ctx = canvas.getContext("2d");

    var legendscale = d3.scaleLinear()
      .range([1, legendheight - margin.top - margin.bottom])
      .domain(data);

    var image = ctx.createImageData(1, legendheight);
    d3.range(legendheight).forEach(function (i) {
      var c = d3.rgb(color_scale(legendscale.invert(i)));
      image.data[4 * i] = c.r;
      image.data[4 * i + 1] = c.g;
      image.data[4 * i + 2] = c.b;
      image.data[4 * i + 3] = 255;
    });


    ctx.putImageData(image, 0, 0);
    var legendaxis = is_hori ? d3.axisBottom() : d3.axisRight()
    legendaxis
      .scale(legendscale)
      .tickSize(6)
      .ticks(10)
      .tickFormat(function (d) {
        if (d < 1 && d > -1) return d; else return d3.format("~s")(d);

      });

    svg
      .attr("height", (is_hori ? 30 : legendheight) + "px")
      .attr("width", (is_hori ? legendheight : legendwidth) + "px")
      .style("left", is_hori ? (-margin.left) : (0) + "px")
      .append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + (is_hori ? margin.top : legendwidth - margin.left - margin.right + 3) + "," + (margin.top) + ")")
      .call(legendaxis)

  } else {
    d3.select(legendContainer).style('overflow', 'auto')
    svg.selectAll("labels")
      .data(data)
      .enter()
      .append("text")
      .attr("class", function (d) { return "category _" + d.replace(/[^a-zA-Z0-9]/g, '') }) // Add a class to each subgroup: their name  
      .on("mouseover", mouseover)
      .on("mouseleave",function(d,i,j){ return opacity==null? mouseleave(d,i,j):mouseleavewithOpacity(opacity) })
      .attr("text-anchor", "left")
      .attr("font-size", '14px')
      .attr("font-family", "Arial")
      .attr("x", function (d, i) { return (i) % 3 * 150 + 25 })
      .attr("y", function (d, i) { return is_hori ? -20 - i * 25 : Math.floor(i / 3) * 25 + 14 })
      .style("fill", function (d) { return color_scale(d) })
      .text(function (d) {
        var text = d + '';
        if (text.length > 20) {
          text = text.slice(0, 17) + '...'
        }
        return text
      })
      .attr("transform", is_hori ? `rotate(90)` : `rotate(0)`)
      .style('cursor', 'pointer')
    var height = data.length * 25;
    height = (height / 3 + 15) + 'px'
    svg.attr('height', height)
    // d3.select(legendContainer).style('width', 'auto').style('height', '60%')

    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", function (d) { return "category _" + d.replace(/[^a-zA-Z0-9]/g, '') }) // Add a class to each subgroup: their name  
      .on("mouseover", mouseover)
      .on("mouseleave", mouseleave)
      .attr("cx", is_hori ? function (d, i) { return 25 + i * 25 } : function (d, i) { return (i) % 3 * 150 + 15 })
      .attr("cy", is_hori ? 15 : function (d, i) { return Math.floor(i / 3) * 25 + 10 })
      .attr("r", 5)
      .style("fill", function (d) { return color_scale(d) })
  }

  svg.style('opacity', 1);

}

export const hideAxes = (container) => {
  d3.select(container).select('svg').select(".trans").selectAll(".x_axis, .y_axis, .x_lable, .y_lable").remove();

}

export const get_color = (data, is_cont = false, defined_colors = {}) => {

  var default_colors = ["#1A1628", "#EC7200","#32A29B","#EAC959","#408CFF","#7FD07D","#8F5AFF"]

  var color;
  if (is_cont) {
    color = d3.scaleSequential(d3[window.configJson.api_data.d3_color_scheme]).domain(data)
  } else {
    data = Object.keys(defined_colors);
    var colorRange = Object.values(defined_colors);
    color = d3.scaleOrdinal().domain(data).range(colorRange);
  }
  return color;
}

export const appear = (element, anim_dur = 1000, ease = d3.easeBack) => {
  d3.select("svg").selectAll(element)
    .transition().duration(anim_dur).ease(ease)
    .style('opacity', 0)
    .transition().duration(anim_dur).ease(ease)
    .style('opacity', 1)
}

export const tooltip = (container, callBack) => {
  var x, y
  window.onmousemove = function (e) {
    x = e.clientX;
    y = e.clientY;
  };
  container.selectAll("title").remove()
  container.append("title")
    .text(function (d) {
      return callBack(d, this);
    })
    .style('top', y)
    .style('left', x)
}

export const mouseover = (d, i, j) => {
  var x, y
  window.onmousemove = function (e) {
    x = e.clientX;
    y = e.clientY;
  };
  var subgroupName = j[i].classList[1];
  d3.selectAll(".category").style("opacity", 0.2)
  d3.selectAll("._" + subgroupName.replace(/[^a-zA-Z0-9]/g, ''))
    .style("opacity", 1)

}

export const mouseleave = (d) => {
  //var subgroupName = j[i].classList[2];
//if(subgroupName=="scatter_circle"){
//   d3.selectAll(".category")
//   .style("opacity", 0.5)
// }
//else{
  d3.selectAll(".category")
  .style("opacity", 1)
//}
}

export const mouseleavewithOpacity=(value)=>{
  d3.selectAll(".category")
  .style("opacity", 1)

  d3.selectAll('circle')
  .style("opacity", value)
}
 

export const addReferenceLine = (container, xGroup, yAxisValue, color, x, y) => {
  if (container.selectAll('.regression').size() === 0) {
    container
      .append("line")
      .attr('class', 'regression')
  }
  var lengthOfXGroup = xGroup.length, xAxisValue;
  if (isNumber(xGroup[0])) { xAxisValue = x(xGroup[lengthOfXGroup - 1] * 1.02) }
  else { xAxisValue = x(xGroup[lengthOfXGroup - 1]) + x.bandwidth() }
  container.select(".regression")
    .attr("x1", x(xGroup[0]))
    .attr("y1", y(yAxisValue))
    .attr("x2", xAxisValue)
    .attr("y2", y(yAxisValue))
    .attr("stroke", color != undefined ? color : "black")
    .attr("stroke-width", 3)
    .style("stroke-dasharray", "5,5")

}

export const onClickChangeChart = async (childChart, height, width, legendContainer, selectedField, selectedValue, ifChildren, pos, configName) => {
  // legendContainer = 'legend_container';
  // var configJson = await GetApiData(process.env.REACT_APP_ENV, configName);
  var configJson = window.configJson;
  var layoutConfig = configJson.api_data.data;
  var definedColor = configJson.api_data.defined_colors;
  if (!ifChildren) {
    var params = JSON.parse(JSON.stringify(layoutConfig.filter((el, i) => { return el.pos === pos })));
    params = params.length !== 0 ? params[0] : params;
    switch (params.chart_type) {
      case "heat_map": {
        var heatChart = new Chart.HeatChart();
        heatChart.props = { xaxisformat:params.xaxisformat, yaxisformat:params.yaxisformat, configName: configName, defined_colors: definedColor, pos: pos, ifClickChildren: false, data: params.data, children: params.clickchildren, x_label: params.x_axis_label, y_label: params.y_axis_label, y_axis: params.chart_data.y_axis_range, legendContainer: legendContainer, height: '800', width: '1000', selectedField: null, selectedValue: null, filterSource: params.filtersource };
        heatChart.drawChart();
        break;
      }
      case "stack_bar_hor": {
        var horiStackChart = new Chart.HorizontalStackBarChart();
        horiStackChart.props = { xaxisformat:params.xaxisformat, yaxisformat:params.yaxisformat, configName: configName, defined_colors: definedColor, pos: pos, ifClickChildren: false, data: params.data, children: params.clickchildren, x_label: params.x_axis_label, y_label: params.y_axis_label, height: height, width: width, legendContainer: legendContainer, selectedField: null, selectedValue: null, filterSource: params.filtersource }
        horiStackChart.drawChart();
        break;
      }
      case "scatter_chart": {
        var scatterChart = new Chart.BubbleChart();
        scatterChart.props = {xaxisformat:params.xaxisformat, yaxisformat:params.yaxisformat, configName: configName, defined_colors: definedColor, pos: pos, ifClickChildren: false, data: params.data, children: params.clickchildren, x_label: params.x_axis_label, y_label: params.y_axis_label, referenceLineValue: params.reference_line_value, referenceLineColor: params.reference_line_color, height: height, width: width, legendContainer: legendContainer, selectedField: null, selectedValue: null, is_bubble: false, filterSource: params.filtersource }
        scatterChart.drawChart();
        break;
      }
      case "stack_bar": {
        var stackChart = new Chart.StackBarChart();
        stackChart.props = { xaxisformat:params.xaxisformat, yaxisformat:params.yaxisformat, configName: configName, defined_colors: definedColor, pos: pos, ifClickChildren: true, data: params.data, children: params.clickchildren, x_label: params.x_axis_label, y_label: params.y_axis_label, referenceLineValue: params.reference_line_value, referenceLineColor: params.reference_line_color, legendContainer: legendContainer, height: height, width: width, selectedField: null, selectedValue: null, filterSource: params.filtersource }
        stackChart.drawChart();
        break;
      }
      case "line_chart": {
        var linChart = new Chart.LineChart();
        linChart.props = { xaxisformat:params.xaxisformat, yaxisformat:params.yaxisformat, configName: configName, defined_colors: definedColor, pos: pos, ifClickChildren: false, data: params.data, children: params.clickchildren, x_label: params.x_axis_label, y_label: params.y_axis_label, referenceLineValue: params.reference_line_value, referenceLineColor: params.reference_line_color, height: height, width: width, legendContainer: legendContainer, selectedField: null, selectedValue: null, filterSource: params.filtersource }
        linChart.drawChart();
        break;
      }
      case "choropleth_chart": {
        var choroplethChart = new Chart.ChoroplethChart();
        choroplethChart.props = {xaxisformat:params.xaxisformat, yaxisformat:params.yaxisformat, configName: configName, defined_colors: definedColor, pos: pos, ifClickChildren: false, data: params.data, legendRange: params.legend_range, children: params.clickchildren, height: height, width: width, legendContainer: legendContainer, selectedField: null, selectedValue: null, filterSource: params.filtersource }
        choroplethChart.drawChart();
        break;
      }
      case "bubble_map":{
        var bubbleMap = new Chart.BubbleMap();
        bubbleMap.props = {xaxisformat:params.xaxisformat, yaxisformat:params.yaxisformat, configName: configName, defined_colors: definedColor, pos: pos, ifClickChildren: false, data: params.data, children: params.clickchildren, referenceLineValue: params.reference_line_value, referenceLineColor: params.reference_line_color, height: height, width: width, legendContainer: legendContainer, selectedField: null, selectedValue: null, filterSource: params.filtersource }
        bubbleMap.drawChart();
        break;
      }
      default: {
      }

    }
  }
  else {    
    switch (childChart.chart_type) {
      case "heat_map": {
        var heatChart = new Chart.HeatChart();
        heatChart.props = { configName: configName, defined_colors: definedColor, pos: pos, ifClickChildren: true, data: childChart.data, children: childChart.clickchildren, x_label: childChart.x_axis_label, y_label: childChart.y_axis_label, height: height, width: width, legendContainer: legendContainer, selectedField: selectedField, selectedValue: selectedValue };
        heatChart.drawChart();
        break;
      }
      case "stack_bar_hor": {
        var horiStackChart = new Chart.HorizontalStackBarChart();
        horiStackChart.props = { configName: configName, defined_colors: definedColor, pos: pos, ifClickChildren: true, data: childChart.data, children: childChart.clickchildren, x_label: childChart.x_axis_label, y_label: childChart.y_axis_label, height: height, width: width, legendContainer: legendContainer, selectedField: selectedField, selectedValue: selectedValue }
        horiStackChart.drawChart();
        break;
      }
      case "scatter_chart": {
        var scatterChart = new Chart.BubbleChart();
        scatterChart.props = { configName: configName, defined_colors: definedColor, pos: pos, ifClickChildren: true, data: childChart.data, children: childChart.clickchildren, x_label: childChart.x_axis_label, y_label: childChart.y_axis_label, height: height, width: width, legendContainer: legendContainer, referenceLineValue: childChart.reference_line_value, referenceLineColor: childChart.reference_line_color, selectedField: selectedField, selectedValue: selectedValue, is_bubble: false }
        scatterChart.drawChart();
        break;
      }
      case "stack_bar": {
        var stackChart = new Chart.StackBarChart();
        stackChart.props = { configName: configName, defined_colors: definedColor, pos: pos, ifClickChildren: true, data: childChart.data, children: childChart.clickchildren, x_label: childChart.x_axis_label, y_label: childChart.y_axis_label, height: height, width: width, legendContainer: legendContainer, referenceLineValue: childChart.reference_line_value, referenceLineColor: childChart.reference_line_color, selectedField: selectedField, selectedValue: selectedValue }
        stackChart.drawChart();
        break;
      }
      case "line_chart": {
        var linChart = new Chart.LineChart();
        linChart.props = {configName: configName, defined_colors: definedColor, pos: pos, ifClickChildren: true, data: childChart.data, children: childChart.clickchildren, x_label: childChart.x_axis_label, xaxisformat:childChart.xaxisformat, yaxisformat:childChart.yaxisformat, y_label: childChart.y_axis_label, height: height, width: width, legendContainer: legendContainer, referenceLineValue: childChart.reference_line_value, referenceLineColor: childChart.reference_line_color, selectedField: selectedField, selectedValue: selectedValue }
        linChart.drawChart();
        break;
      }
      default: {
      }

    }
  }

}

export const createCustomTooltip = (container) => {

  if (d3.select(container).selectAll('.new_tooltip').size() === 0) {
    d3.select(container)
      .append("div")
      .style("opacity", 0)
      .style("position", "absolute")
      .attr("class", "new_tooltip")
      .style("display", "inline-block")
      .style("background", "rgb(255,255,255)")
      //.style("border", "1px solid #1f77b4")
      .style("padding", "5px 5px")
      .style("color", "#000")
      .style("font-size", "12px")
      .style("white-space", "pre")
      .style("text-align", "left")
      .style("cursor", "default")
      .style("pointer-events", "none")
  }
}

export const showCustomTooltip = (that, callback) => {
  var transElement = d3.selectAll('svg').select('.trans').attr('transform');
  var translate = transElement.substring(transElement.indexOf("(") + 1, transElement.indexOf(")")).split(",");
  // var x=d3.mouse(that)[0]+Number(translate[0]);
  // var y=d3.mouse(that)[1]+Number(translate[1]);

  var x = d3.event.pageX - document.getElementById('chart-container').getBoundingClientRect().x + 10;
  var y = d3.event.pageY - document.getElementById('chart-container').getBoundingClientRect().y + 60;

  const tooltip = d3.selectAll('.new_tooltip');
  tooltip.transition()
    .duration(50)
    .style("opacity", 1)
    .text(function () {
      return callback();
    })
    .style("left", (x + "px"))
    .style("top", (y + "px"))
  //.style('left',75+"px")
  //.style('top',30+"px")

}
export const hideCustomTooltip = () => {
  const tooltip = d3.selectAll('.new_tooltip');
  tooltip
    .transition()
    .duration(200)
    .style("opacity", 0)
}

export const moveCustomTooltip = (d) => {

  var transElement = d3.selectAll('svg').select('.trans').attr('transform');
  var translate = transElement.substring(transElement.indexOf("(") + 1, transElement.indexOf(")")).split(",");
  //  var x=d3.mouse(that)[0]+Number(translate[0]);
  // var y=d3.mouse(that)[1]+Number(translate[1]);

  var x = d3.event.pageX - document.getElementById('chart-container').getBoundingClientRect().x + 10;
  var y = d3.event.pageY - document.getElementById('chart-container').getBoundingClientRect().y + 60;
  const tooltip = d3.selectAll('.new_tooltip');
  tooltip
    .style("left", (x + "px"))
    .style("top", (y + "px"))
  // .style('left',75+"px")
  // .style('top',30+"px")
}

export const secondAxisLineChart=(container,data,anim_dur,x,y2,color)=>{
 container.selectAll('.newPath')
      .data(data).enter()
      .append('path')
      .attr("class", function (d) { return "category _" + d.key.replace(/[^a-zA-Z0-9]/g, '') })
      .on("mouseover", mouseover)
      .on("mouseleave", mouseleave)
      /* .on("click", function (d) {
        var selected_field = d.key;
        if (clickToFilter) {
          var newArr = data.filter(function (e) {
            return e[filterSource] == selected_field;
          });
          var redraw = new LineChart();
          redraw.props = {configName: configName, defined_colors: definedColors, data: newArr, width: re_width, height: re_height, x_label: x_label, y_label: y_label, legendContainer: legendContainer.slice(1), clickToFilter: clickToFilter, children: children, filterSource: filterSource, referenceLineValue: referenceLineValue, referenceLineColor: referenceLineColor }
          redraw.drawChart();
        }
        else if (Object.keys(children).length != 0) {
          var childChart = children;

          if (ifClickChildren) {
            cu.onClickChangeChart(null, re_height, re_width, null, null, null, false, pos, configName);

          } else {
            cu.onClickChangeChart(childChart, re_height, re_width, legendContainer.slice(1), children.filtertarget, selected_field, true, pos, configName);

          }
        }
      }) */
      .transition().duration(anim_dur).ease(d3.easeBack)
      .attr("fill", "none")
      .attr("stroke", function (d) { return color(d.key) })
      .attr("stroke-width", 4/* function (d) { var count = res.length; if (count < 6) return 10; else if (count >= 15) return 4; else return 15 - count; } */)
      .attr("d", function (d) {
        return d3.line()
          .x(function (d) { return x(d.x_axis); })
          .y(function (d) { return y2(+d.y_axis); })
          (d.values)
      })
      .style("opacity", 1)

}

export const secondAxisScatterChart=(container,data,x,y2,z,color,xAxisFormat,yAxisFormat,x_label,y_label)=>{

  var colors = data.map(function (obj) { return obj.color; });
    colors = colors.filter(function (v, i) { return colors.indexOf(v) == i; });
    let unique_value_count = new Set(data.map(x => x.value)).size;

  container.selectAll(".newcircle")
  .data(data).enter().append('circle')
  .attr('transform', null)
  .attr("class", function (d) { return "category _" + d.color.replace(/[^a-zA-Z0-9]/g, '') + " new_scatter_circle" })
  .on("mouseover", function (d, i, j) {
    showCustomTooltip(this, function () {
      if (colors.length === 1) return x_label + ": " + formatNumber(d.x_axis, xAxisFormat) + "\n" + y_label + ": " + formatNumber(d.y_axis, yAxisFormat) + (unique_value_count > 1 ? "\nValue: " + formatNumber(d.value) : "") + (d.lod != undefined ? "\n" + formatNumber(d.lod) : "");
      return formatNumber(d.color) + "\n" + x_label + ": " + formatNumber(d.x_axis, xAxisFormat) + "\n" + y_label + ": " + formatNumber(d.y_axis, yAxisFormat) + (unique_value_count > 1 ? "\nValue: " + formatNumber(d.value) : "") + (d.lod != undefined ? "\n" + formatNumber(d.lod) : "");
    });
    mouseover(d, i, j);
  })
  .on("mousemove", function () {
    moveCustomTooltip(this)
  })
  .on("mouseleave", function (d) {
    hideCustomTooltip();
    d3.selectAll(".category").style("opacity", 0.5)
  })
  // .on("click", function (d) {
  //   if (clickToFilter) {
  //     var selected_field = d.color;
  //     var newArr = data.filter(function (e) {
  //       return e[filterSource] == selected_field;
  //     });
  //     var redraw = new BubbleChart();
  //     redraw.props = { configName: configName, defined_colors: definedColors, data: newArr, width: re_width, height: re_height, x_label: x_label, y_label: y_label, legendContainer: legendContainer.slice(1), clickToFilter: clickToFilter, children: children, filterSource: filterSource, referenceLineValue: referenceLineValue, referenceLineColor: referenceLineColor, yaxisformat: yAxisFormat, xaxisFormat: xAxisFormat }
  //     redraw.drawChart();
  //   } else if (Object.keys(children).length != 0) {
  //     var selected_field = d[filterSource];
  //     var childChart = children;
  //     if (ifClickChildren) {
  //       cu.onClickChangeChart(null, re_height, re_width, null, null, null, false, pos, configName);

  //     } else {
  //       cu.onClickChangeChart(childChart, re_height, re_width, legendContainer.slice(1), children.filtertarget, selected_field, true, pos, configName);

  //     }
  //   }
  // })
  .attr("r", function (d) { return z(d.value); })
  .attr("cx", function (d) { return x(d.x_axis); })
      .attr("cy", function (d) { return y2(d.y_axis-3); })
  .style("fill", function (d) { return color(d.color); })
  .style("opacity", 0.5)


}