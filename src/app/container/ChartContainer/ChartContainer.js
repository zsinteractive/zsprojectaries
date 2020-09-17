//Importing required libraries & modules
import React from 'react';
import useState from 'react';
import { Grid } from '@material-ui/core';
import * as Chart from '../../charts';
import * as d3 from 'd3';
import styleJson from '../../styles/styles'
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import GetApiData from './../../utils/getApiData';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useSpring, animated } from 'react-spring';
import { InteractivityContainer } from './../../container';
import ReactLoading from "react-loading";
import { FilterData } from './../../components/Interactivity';
import MakeAxis from './../../utils/AxisInteractivity';
import styleConfig from './../../styles/root';
import { Carousel } from "react-responsive-carousel";
import ImageLoader from 'react-load-image';
import ImageMapper from 'react-image-mapper';
// importing underscore to use some basic operations
const _ = require('underscore');

//defining default chart height & width
const chartHeight = 700;
const chartWidth = 900;

// Render Chart component to render chart
const RenderChart = (props) => {

  //data cleaning
  var params = props.config;
  params = (params.length === 0 || params.length === undefined) ? params : params[0];

  const imageEntry = useSpring({
    config: {duration: 1000},
    to: {opacity: 1,
      maxWidth: '95%',
      // marginTop: (params.pos == 0)?'28%': params.layout==='center-top'?'-17%':'0',
      animation: '1s ease-out 1s 1 slideInFromLeft'
    },
    from: {opacity: 0}
  })
  //animations
  var chart_animations = styleConfig.animations.chart;
  //Switch block for chart 
  //renders chart based on chart_type provided by user
  //some charts clean their containers (legend & chart containers) before starting 
  switch (params.chart_type) {
    case 'scatter_chart':
      return <Chart.BubbleChart configName = {props.configName} xaxisformat={params.xaxisformat} yaxisformat={params.yaxisformat} animation={chart_animations} isParent={true} data={params.data} is_bubble={false} clickToFilter={params.clicktofilter} children={params.clickchildren} filterSource={params.filtersource} x_label={params.x_axis_label} y_label={params.y_axis_label} referenceLineValue={params.reference_line_value} referenceLineColor={params.reference_line_color} pos={params.pos} legendContainer={props.legendContainer} height={props.height} width={props.width} selectedField={null} selectedValue={null} defined_colors = {props.defined_color}/>
    case 'packed_bubble_chart':
      d3.select('#legend_container').selectAll('svg').remove();
      d3.select('#legend_container').selectAll('canvas').remove();
      return <Chart.CirclePackedBubble configName = {props.configName} animation={chart_animations} isParent={true} data={params.data} pos={params.pos} legendContainer={props.legendContainer} height={props.height} width={props.width} defined_colors = {props.defined_color}/>
      case 'network_chart':
        d3.select('#legend_container').selectAll('svg').remove();
        d3.select('#legend_container').selectAll('canvas').remove();
        return <Chart.NetworkChart configName = {props.configName} animation={chart_animations} isParent={true} data={params.data} pos={params.pos} legendContainer={props.legendContainer} height={props.height} width={props.width} defined_colors = {props.defined_color}/>
      case 'bubble_chart':
      return <Chart.Bubble children = {params.children} filterSource={params.filtersource} clickToFilter={params.clicktofilter}  attraction = {params.attraction} collide={params.collide} alphaDecay={params.alphaDecay} zLowerLimit = {params.zLowerLimit} zUpperLimit={params.zUpperLimit} outterCircleRadius={params.outterCircleRadius} configName = {props.configName} configName = {props.configName} xaxisformat={params.xaxisformat} yaxisformat={params.yaxisformat} animation={chart_animations} isParent={true} data={params.data} is_bubble={true} pos={params.pos} legendContainer={props.legendContainer} height={props.height} width={props.width} defined_colors = {props.defined_color}/>
    case 'stack_bar':
      return <Chart.StackBarChart configName = {props.configName} xaxisformat={params.xaxisformat} yaxisformat={params.yaxisformat} animation={chart_animations} isParent={true} data={params.data} clickToFilter={params.clicktofilter} children={params.clickchildren} filterSource={params.filtersource} x_label={params.x_axis_label} y_label={params.y_axis_label} referenceLineValue={params.reference_line_value} referenceLineColor={params.reference_line_color} pos={params.pos} legendContainer={props.legendContainer} height={props.height} width={props.width} selectedField={null} selectedValue={null} defined_colors = {props.defined_color}/>
      case 'choropleth_chart':
        return <Chart.ChoroplethChart hideTooltipBottomValue={params.color} configName = {props.configName} xaxisformat={params.xaxisformat} yaxisformat={params.yaxisformat} animation={chart_animations} isParent={true} data={params.data} legendRange={params.legend_range} x_label={params.x_axis_label} y_label={params.y_axis_label} clickToFilter={params.clicktofilter} children={params.clickchildren} filterSource={params.filtersource} pos={params.pos} referenceLineValue={params.reference_line_value} referenceLineColor={params.reference_line_color} legendContainer={props.legendContainer} height={props.height} width={props.width} selectedField={null} selectedValue={null} defined_colors = {props.defined_color}/>
    case 'stack_bar_hor':
      return <Chart.HorizontalStackBarChart configName = {props.configName} xaxisformat={params.xaxisformat} yaxisformat={params.yaxisformat} animation={chart_animations} isParent={true} data={params.data} clickToFilter={params.clicktofilter} children={params.clickchildren} filterSource={params.filtersource} x_label={params.x_axis_label} y_label={params.y_axis_label} pos={params.pos} legendContainer={props.legendContainer} height={props.height} width={props.width} defined_colors = {props.defined_color}/>
    case 'sun_burst':
      d3.select('#legend_container').selectAll('svg').remove();
      d3.select('#legend_container').selectAll('canvas').remove();
      return <Chart.SunBurst configName = {props.configName} xaxisformat={params.xaxisformat} yaxisformat={params.yaxisformat} animation={chart_animations} data={params.data} height={props.height} width={props.width} pos={params.pos} legendContainer={props.legendContainer} defined_colors = {props.defined_color}/>
    case 'line_chart':
      return <Chart.LineChart configName = {props.configName} xaxisformat={params.xaxisformat} yaxisformat={params.yaxisformat} animation={chart_animations} secondAxis={params.secondchart} isParent={true} data={params.data} x_label={params.x_axis_label} y_label={params.y_axis_label} clickToFilter={params.clicktofilter} children={params.clickchildren} filterSource={params.filtersource} pos={params.pos} referenceLineValue={params.reference_line_value} referenceLineColor={params.reference_line_color} legendContainer={props.legendContainer} height={props.height} width={props.width} selectedField={null} selectedValue={null} defined_colors = {props.defined_color}/>
    case 'heat_map':
      d3.select('#legend_container').selectAll('svg').remove();
      return <Chart.HeatChart configName = {props.configName} xaxisformat={params.xaxisformat} yaxisformat={params.yaxisformat} legendRange={params.legend_range} animation={chart_animations} data={params.data} x_label={params.x_axis_label} y_label={params.y_axis_label} pos={params.pos} legendContainer={props.legendContainer} height={props.height} width={props.width} selectedField={null} selectedValue={null} defined_colors = {props.defined_color}/>
    case 'sankey':
      d3.select('#legend_container').selectAll('svg').remove();
      d3.select('#legend_container').selectAll('canvas').remove();
      return <Chart.SankeyChart configName = {props.configName} xaxisformat={params.xaxisformat} yaxisformat={params.yaxisformat} animation={chart_animations} isParent={true} dvar={params.data} x_label={params.x_axis_label} y_label={params.y_axis_label} height={props.height} width={props.width} pos={params.pos} legendContainer={props.legendContainer} defined_colors = {props.defined_color}/>
    case 'funnel_chart':
      d3.select('#legend_container').selectAll('svg').remove();
      d3.select('#legend_container').selectAll('canvas').remove();
      d3.select('#chart-container').selectAll('svg').remove();
      return <Chart.Funnel configName = {props.configName} xaxisformat={params.xaxisformat} yaxisformat={params.yaxisformat} animation={chart_animations} data={params.data} x_label={params.x_axis_label} y_label={params.y_axis_label} height={props.height} width={props.width} pos={params.pos} legendContainer={props.legendContainer} defined_colors = {props.defined_color}/>
    case 'decision_tree':
      d3.select('#legend_container').selectAll('svg').remove();
      return <Chart.DecisionTree configName = {props.configName} xaxisformat={params.xaxisformat} yaxisformat={params.yaxisformat} animation={chart_animations} data={params.data} x_label={params.x_axis_label} y_label={params.y_axis_label} height={props.height} width={props.width} pos={params.pos} legendContainer={props.legendContainer} defined_colors = {props.defined_color}/>
    case 'illu_image':
      d3.select('#' + props.legendContainer).selectAll('svg').remove();
      d3.select('#chart-container').selectAll('svg').remove();
      d3.select('#chart-container').selectAll('.new_tooltip').remove();
      return <animated.img src={require('./../../../images/' + params.img_name)} style={imageEntry} width='auto'></animated.img>
    case 'illu_image2':
      d3.select('#' + props.legendContainer).selectAll('svg').remove();
      d3.select('#chart-container').selectAll('svg').remove();
      d3.select('#chart-container').selectAll('.new_tooltip').remove();
      return (<div>
        <animated.img src={require('./../../../images/' + params.img_name2)} style={imageEntry} width='auto'></animated.img>
        <animated.img src={require('./../../../images/' + params.img_name)} style={imageEntry} width='auto'></animated.img>
      </div>)
        
    case 'multi_image':
      d3.select('#chart-container').selectAll('svg').remove();
      return(
      <Carousel autoPlay showArrows={true}>
        {
          params.img_name.map((img) => {
            return(
              <div>
                <img src={require('./../../../images/' + img)} width = {'auto'} style={{imageEntry, maxWidth: '95%'}}></img>
              </div>
            )
          })
        }
      </Carousel>
      )
    case 'tree_chart':
      d3.select('#legend_container').selectAll('svg').remove();
      d3.select('#legend_container').selectAll('canvas').remove();
      return <Chart.TreeChart configName = {props.configName} animation={chart_animations} defined_colors = {props.defined_color} isParent={true} data={params.data} pos={params.pos} legendContainer={props.legendContainer} height={props.height} width={props.width} />
    case 'image_map':
        d3.select('#chart-container').selectAll('svg').remove();
      var MAP = {
        name: 'image_map',
        areas:[
          {name: "1", shape: "poly", coords: [436,22,329,205,544,205]},
          {name: "2", shape: "poly", coords: [327,205,259,331,615,332,543,207]},
          {name: "3", shape: "poly", coords: [255,330,163,490,706,490,615,330]}
        ]
      }
      return <ImageMapper
      id = {'image_map'}
      src = {require("./../../../images/pyramid_main.png")}  
      map= {MAP}
      onImageClick = {e => {
        console.log(e)
        document.images[1].useMap = "#image_map"
        document.images[1].src = require("./../../../images/pyramid_main.png")
      }}
      onClick = {area => {
        console.log(area);
        document.images[1].useMap = null
        if(area.name == "1"){
          document.images[1].src =  require("./../../../images/pyramid1.png")
        } else if(area.name == "2"){
          document.images[1].src =  require("./../../../images/pyramid2.png")
        } else if(area.name == "3"){
          document.images[1].src =  require("./../../../images/pyramid3.png")
        }
        
      }} />
  
    // case 'image_map1':
    //   d3.select('#chart-container').selectAll('svg').remove();
    // var MAP = {
    //   name: 'image_map1',
    //   areas:[
    //     {name: "1", shape: "rect", coords: [345,130,474,259]},
    //     {name: "2", shape: "rect", coords: [481,133,609,257]},
    //     {name: "3", shape: "rect", coords: [343,267,472,393]},
    //     {name: "4", shape: "rect", coords: [481,268,606,392]}
    //   ]
    // }
    // return <ImageMapper 
    // id = {'image_map_2'}
    // src = {require("./../../../images/clicktoshift.png")}  
    // map= {MAP}
    // onImageClick = {e => {
    //   console.log(e)
    //   document.images[0].useMap = "#image_map1"
    //   document.images[0].src = require("./../../../images/clicktoshift.png")
    // }}
    // onClick = {area => {
    //   console.log(area);
    //   document.images[0].useMap = null
    //   if(area.name == "1"){
    //     window.pageScroll.scrollToPage(5)
    //   } else if(area.name == "2"){
    //     window.pageScroll.scrollToPage(7)
    //   } else if(area.name == "3"){
    //     window.pageScroll.scrollToPage(6)
    //   } else if(area.name == "4"){
    //     window.pageScroll.scrollToPage(8)
    //   }
      
    // }} />
    case 'heb_chart':
      return <Chart.HEB configName = {props.configName} xaxisformat={params.xaxisformat} yaxisformat={params.yaxisformat} animation={chart_animations} isParent={true} data={params.data} is_bubble={false} clickToFilter={params.clicktofilter} children={params.clickchildren} filterSource={params.filtersource} x_label={params.x_axis_label} y_label={params.y_axis_label} referenceLineValue={params.reference_line_value} referenceLineColor={params.reference_line_color} pos={params.pos} legendContainer={props.legendContainer} height={props.height} width={props.width} selectedField={null} selectedValue={null} defined_colors = {props.defined_color}/>
    case 'bubble_map':
      return <Chart.BubbleMap configName = {props.configName} xaxisformat={params.xaxisformat} yaxisformat={params.yaxisformat} animation={chart_animations} isParent={true} data={params.data} is_bubble={false} clickToFilter={params.clicktofilter} children={params.clickchildren} filterSource={params.filtersource} x_label={params.x_axis_label} y_label={params.y_axis_label} referenceLineValue={params.reference_line_value} referenceLineColor={params.reference_line_color} pos={params.pos} legendContainer={props.legendContainer} height={props.height} width={props.width} selectedField={null} selectedValue={null} defined_colors = {props.defined_color}/>
    default:
      d3.select('#chart-container').selectAll('svg').remove();
      return null
  }

}

function useWindowSize() {
  const isClient = typeof window === 'object';
  return {
    width: isClient ? window.innerWidth : undefined,
    height: isClient ? window.innerHeight : undefined
  }
}

//initiating ChartContainer 
class ChartContainer extends React.Component {
  //defining state
  constructor(props) {
    super(props);
    this.state = {
      selectedChart: 'parent', //Keeps track of chart being displayed. Default == parent & will only change through user interactivity
      columnFilterValue: null, //to keep track of column filter value. Default is 'all' & will not require any sort of filtering
      xAxis: null,
      yAxis: null,
      screenSize: useWindowSize()
    }
    this.chartContainer = React.createRef()
    this.ChartContainerWidth = null;
    this.ChartContainerHeight = null;
  }

  ///update screen Size
  updateWindowDimension = () => {
    this.setState({
      screenSize: useWindowSize()
    })
  }

  //for interactivity [changes chart from parent to others]
  handleSelectInputChange = (selectedOption) => {
    // debugger
    this.setState({
      selectedChart: selectedOption.value
    })
  }

  handleFilterOnColumn = (selectedOption) => {
    this.setState({
      columnFilterValue: selectedOption.value
    })
  }

  handleXAxis = (selectedOption) => {
    this.setState({
      xAxis: selectedOption.value
    })
  }

  handleYAxis = (selectedOption) => {
    this.setState({
      yAxis: selectedOption.value
    })
  }

  componentWillReceiveProps() {
    var layoutConfig = this.props.layoutConfig;
    var params = JSON.parse(JSON.stringify(layoutConfig.filter((el, i) => { return el.pos === this.props.visibleItem })));
    params = params.length !== 0 ? params[0] : params;
    this.setState({
      selectedChart: "parent",
      columnFilterValue: null,
      xAxis: null,
      yAxis: null
    })
  }
  
  componentDidMount() {
    var layoutConfig = this.props.layoutConfig;
    var params = JSON.parse(JSON.stringify(layoutConfig.filter((el, i) => { return el.pos === this.props.visibleItem })));
    params = params.length !== 0 ? params[0] : params;
    this.updateWindowDimension();
    window.addEventListener('resize', this.updateWindowDimension);
    this.setState({
      columnFilterValue: null
    })
  }

  async componentWillMount() {
    var layoutConfig = this.props.layoutConfig;
    var params = JSON.parse(JSON.stringify(layoutConfig.filter((el, i) => { return el.pos === this.props.visibleItem })));
    params = params.length !== 0 ? params[0] : params;
    this.setState({
      columnFilterValue: null
    })
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimension);
  }



  render() {
    //data cleaning
    var layoutConfig = this.props.layoutConfig
    var params = JSON.parse(JSON.stringify(layoutConfig.filter((el, i) => { return el.pos === this.props.visibleItem })));
    var config = JSON.parse(JSON.stringify(params));
    params = params.length !== 0 ? params[0] : params;
    const options = [{ value: 'parent', label: params.title }]
    //interactivity enabler: creates dropdown for childern capability
    for (var key in params.children) {
      if (params.children.hasOwnProperty(key)) {
        options.push({ value: '' + key, label: '' + key })
      }
    }

    const filterOptions = [];
    //Setting data as per state of the app
    //if selected chart === parent
    //if selectedChart !== parent
    if (this.state.selectedChart !== "parent") {
      config = params.children[this.state.selectedChart]
    }


    //checking for filter column interactivity:: if this.state.columnFilterValue !== all then we need to filter data
    var columnFilterValue = null;
    if (params.filtercolumn) {
      var filterValues = params.filtervalues.sort();
      filterValues.map(val => {
        filterOptions.push({ value: '' + val, label: '' + val })
      })
      if (this.state.columnFilterValue === null) columnFilterValue = filterValues[0];
      else columnFilterValue = this.state.columnFilterValue
    }
    config = FilterData(JSON.parse(JSON.stringify(config)), params.filtercolumn, columnFilterValue)

    //making xAxis & yAxis filters 
    var xAxisOptions = [], yAxisOptions = [];
    if (params.x_axis_values && params.y_axis_values) {
      var xAxis, yAxis;
      //making values to fill into the filters
      params.x_axis_values.sort().map(val => {
        xAxisOptions.push({ value: '' + val, label: '' + val })
      })
      yAxis = 
      params.y_axis_values.sort().map(val => {
        yAxisOptions.push({ value: '' + val, label: '' + val })
      })
      if (this.state.xAxis === null) {
        xAxis = xAxisOptions[0].value;
      } else {
        xAxis = this.state.xAxis
      }
      if (this.state.yAxis === null) {
        yAxis = yAxisOptions[0].value;
      } else {
        yAxis = this.state.yAxis
      }
      config[0].x_axis_label = xAxis;
      config[0].y_axis_label = yAxis;
      config = MakeAxis(JSON.parse(JSON.stringify(config)), xAxis, yAxis)
    }

    //  var ifInteractive = (params.x_axis_values && params.y_axis_values) || (params.hasOwnProperty('children') && Object.keys(params.children).length  !== 0) || params.filtercolumn
    var chartHeight = this.state.screenSize.height * 0.80;
    var chartWidth = this.state.screenSize.width * 0.56;
    var leftChartPos, superContainerWidth;

    if(params.chart_type === 'packed_bubble_chart'){
      var chartHeight = this.state.screenSize.height * 0.90;
    var chartWidth = this.state.screenSize.width * 0.56;
    }
    // if(params.chart_type === 'bubble_map'){
    //   var chartHeight = this.state.screenSize.height * 0.90;
    // var chartWidth = this.state.screenSize.width * 0.56;
    // }

    if (params.chart_type === 'sun_burst') {
      chartHeight = this.state.screenSize.height * 0.80
    } else if (params.chart_type === 'sankey') {
      chartHeight = this.state.screenSize.height * 0.80
    }
    
    if(params.layout === 'center-top' ){
      chartHeight = this.state.screenSize.height*0.60;
    }
    
    if(params.layout === 'center-bottom'){
      chartHeight = this.state.screenSize.height*0.55;
    }


    if (params.chart_type === 'sun_burst') {
      chartWidth = this.state.screenSize.width * 0.47;
    }
    if (params.pos === 0 || params.pos === -1) {
      chartWidth = this.state.screenSize.width * 0.46;
    }

    if (params.pos === 0 || params.pos === -1) {
      leftChartPos = '50%'
    } else {
      leftChartPos = params.layout === 'left-text' ? '40%' : '1%'
    }

    if (params.pos === 0 || params.pos === -1) {
      superContainerWidth = '46%'
    } else {
      superContainerWidth = (params.layout === "center-top" || params.layout === "center-bottom") ? "100%" : "56%"
    }
    var legendContainer;
    if(params.layout === 'center-bottom' || params.layout === 'center-top'){
      legendContainer = 'legend_container'
    } else {
      legendContainer = 'legend_container_' + this.props.visibleItem
    }
    

    return (
      //container for chart, interactivity & legends
      //changes properties base on layout provided by user to the currently visible item
      <Grid container xs={12} direction='row' id='super-container' style={{
        position: 'fixed',
        top: (params.layout !== 'center-top' && params.layout !== 'center-bottom' && params.pos !== 0) ? '9vh' : params.layout==='center-bottom'? '4vh': params.chart_type === 'packed_bubble_chart'?'0vh': params.chart_type === 'multi_image'?'-16vh': (params.pos === 3)? '-25vh': (params.pos === 0)?'31vh':(params.pos === 4)?'-9vh': (params.pos === 6)?'-10vh':(params.pos === 10)?'-16vh':'5vh',
        left: leftChartPos,
        width: superContainerWidth,
        marginLeft: ((params.layout === 'right-text' || params.layout === 'center-top' || params.layout === 'center-bottom') && params.pos !== 10) ? "5vh" :( params.pos === 10)?'52vh': '0vh',
        marginTop: params.layout === "center-top" ? "25vh" : "0",
        marginBottom: params.layout === "center-bottom" ? "50vh" : "0",
        zIndex: 1
      }}>
        {/* Layout for layouts other than legends_align === bottom.
          In case of legend_align === bottom, the container follows a column direction meanwhile for others, it follows row direction*/}
        {
          // Changing direction for text alignments
          <Grid container direction={params.layout === 'right-text' ? 'row-reverse' : 'row'}>
            {/* Adding an empty grid in case of right-text for better visibility [did not use margin as it is more reliable] */}
            {/* {params.layout ==='right-text' && <Grid xs={1} style ={{right:0, height:'10%', maxHeight: screenSize.height*0.6, padding: '2%', overflowY:'auto'}}></Grid>} */}
            <Grid item direction = 'row' xs={(params.layout === 'center-top' || params.layout === 'center-bottom') ? 7 : 12} style={{ marginLeft: (params.chart_type === 'illu_image' && (params.layout === 'center-top' || params.layout === 'center-bottom')) ? '20.865%' : (params.chart_type === 'multi_image' || params.chart_type === 'image_map1')?'17%': '0' }}>
              {/* Container for interactivity & chart. interactivity will always be on top */}
              <Grid xs = {(params.layout === 'center-top' || params.layout === 'center-bottom') ?12: 12} item direction='column' style={{ marginLeft: params.layout === 'right-text' ? '0' : '0' }}>
                {/* checking interactivity requirements & rendering components conditionally*/}
                <Grid container direction={'row'} id='interactivity_plus_legend' style={{ display: 'flex', height: (params.pos === 0 || params.chart_type === 'packed_bubble_chart' || params.pos === 1 || params.pos === 8) ? 0 : '7vh' }} >
                  {/* <div item id={'legend_container'} style={{ height: (params.chart_type === 'illu_image' || params.pos === 0 || params.if_end) ? 0 : '6vh', marginTop: 'auto', marginBottom: 'auto', maxHeight: '6vh', overflow: 'auto' }}></div> */}
                  {(params.x_axis_values && params.y_axis_values) &&
                    <div style={{ flexGrow: 2, display: 'flex' }}>
                      {(xAxisOptions.length > 1) && <Grid item xs={6}>
                        {/* Rendering selectInput for interactivity. Creating a div for label & then passing that label to <Select> component*/}
                         <InteractivityContainer isRadio={params.button_or_dropdown === 'button' ? true : false} hasValue={false} options={xAxisOptions} handleChange={this.handleXAxis} label={'Select X-Axis'} />
                      </Grid>}
                      {(yAxisOptions.length > 1) && <Grid item xs={6}>
                        <InteractivityContainer isRadio={params.button_or_dropdown === 'button' ? true : false} options={yAxisOptions} handleChange={this.handleYAxis} label={'Select Y-Axis'} />
                      </Grid>}
                    </div>}
                  {/* Checking if the chart as any children components & rendering SelectInput conditionally */}
                  {(params.hasOwnProperty('children') && Object.keys(params.children).length !== 0) &&
                    <div style={{ flexGrow: 2 }}>
                      <div item xs={6}>
                        {/* <div id = 'children-change-option-lable' style={{fontSize: '18px'}}>Select Children</div> */}
                        {/* <Select width ='200' aria-labelledby = {'children-change-option-lable'} options={options} onChange = {this.handleSelectInputChange} /> */}
                        <InteractivityContainer isRadio={params.button_or_dropdown === 'button' ? true : false} options={options} handleChange={this.handleSelectInputChange} label={params.button_or_dropdown === 'button' ?'':'Select to toggle charts'} />
                      </div>
                    </div>}
                  {params.filtercolumn &&
                    <div style={{ flexGrow: 2 }}>
                      <div item xs={6} >
                        <InteractivityContainer isRadio={params.button_or_dropdown === 'button' ? true : false} options={filterOptions} label= {params.button_or_dropdown === 'button'?'':'Filter chart'} handleChange={this.handleFilterOnColumn} />
                      </div>
                    </div>
                  }
                </Grid>
                {/* Creating container for charts & calling RenderChart*/}
                <Grid item id='chart-container' ref={this.chartContainer} xs={12} direction = 'row'>
                  <RenderChart configName = {this.props.configName} config={config} height={chartHeight} width={chartWidth} legendContainer = {legendContainer} defined_color = {this.props.defined_color} />
                </Grid>
              </Grid>
              
            </Grid>
            {/* <Grid xs = {2} item>
                {((params.layout==='center-top' || params.layout==='center-bottom' ) && params.chart_type !== 'illu_image') && <div id = 'legend_container'></div>}
            </Grid> */}
            {(params.layout === 'center-top' || params.layout === 'center-bottom') && <Grid xs = {params.layout==='right-text'?5:5} id = {'legend_container'} style ={{right:0, height:'fill-content', maxHeight: '80%', overflowY:'auto'}}></Grid> }

          </Grid>
        }
      </Grid>
    )
  }

}

export default ChartContainer;