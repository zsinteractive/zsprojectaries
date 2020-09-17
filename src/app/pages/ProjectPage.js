import React from 'react';
import { withRouter } from "react-router";
import {Grid, Typography, makeStyles, withStyles, Button} from '@material-ui/core';
import ScrollSnap from 'scroll-snap';
import * as Layout from './../layout';
import {SectionsContainer, Section} from 'react-fullpage'
import "fullpage.js/vendors/scrolloverflow"; // Optional. When using scrollOverflow:true
import ReactFullpage from "@fullpage/react-fullpage";
import * as Container from './../container';
import PropTypes  from 'prop-types';
import * as d3 from 'd3';
import GetApiData from './../utils/getApiData';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import $ from 'jquery';
import ReactLoading from "react-loading";
import ScrollUpButton from "react-scroll-up-button";
import styleJson from './../styles/root';
import ReactPageScroller from 'react-page-scroller';
import ReactHtmlParser from 'react-html-parser'; 
import * as Component from './../components';
import ScrollElement from './../components/ScrollElement/ScrollElement';
var Pageable = require('pageable');

const styles = theme => (styleJson)

function sortByKey(array, key) {
  return array.sort(function(a, b) {
      var x = a[key]; var y = b[key];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}


class ProjectPage extends React.Component {
    constructor(props){
        super(props);    
        this.state={
            visibleItem: (parseInt(window.location.href.split("-")[1]))?parseInt(window.location.href.split("-")[1]):0, //Variable to keep track of visible item on screen [Element at position 1 is visible by default]
            configJson: null
        }
        this.handleScrolling = this.handleScrolling.bind(this)
    }
    
    handleScrolling(index){
      this.setState({
        visibleItem: index
      })
      console.log('visible item: ' + this.state.visibleItem)
    }

    componentDidMount(){
      // let index = window.location.href.split('-')[1]
      // console.log('index: ' + index)
      // this.handleScrolling(index)
      $(document).ready(function(){
        $('#jugad_button').click()
      })
    }

    render(){
      
        const {classes} = this.props;
        // document.getElementById('app_container').style.background = 'none'
        var layoutConfig = null;
        if(this.state.configJson){
           layoutConfig = this.state.configJson.api_data.data;
            layoutConfig = sortByKey(layoutConfig, 'pos');
            var layoutLen = layoutConfig.length;
            var normalScroll = []
            for(let i=0; i<layoutLen; i++){
              normalScroll.push('#layout_container_' + i);
              normalScroll.push('#para_div_' + layoutConfig[i].pos )
            }
            var defined_color = this.state.configJson.api_data.defined_colors;
        }
        var fullpage_api;
        
        return(
            <div>
            {!this.state.configJson &&
             <div>
             <Button id = 'jugad_button' onClick = {async () =>{
                    let apiOutput = await GetApiData(process.env.REACT_APP_ENV, this.props.configName)
                    window.configJson = apiOutput
                    this.setState({
                        configJson: apiOutput
                    })
                    
                }}></Button>
                <div style ={{marginTop: '25vh', marginLeft: '93vh'}}>
                  <ReactLoading type={'bars'} color={"gray"} heigh={'20%'} width={'20%'} />
                </div>
                </div>
                }
            {this.state.configJson && 
              <div className = {classes.root}>
                <div id = 'onepage'>
                <Layout.ScrollLayout fullpage_api = {''} layoutConfig = {layoutConfig} configJson = {this.state.configJson} handleScroll={this.handleScrolling}/>
                </div>
                <Container.ChartContainer configName = {this.props.configName} defined_color = {defined_color} visibleItem = {this.state.visibleItem} scroll0 = {0} layoutConfig = {layoutConfig} chartDetails = {layoutConfig.filter((el, i) => {return el.pos === this.state.visibleItem})}/>
                <div id = 'scroll_to_top_button' className = {classes.button_to_top}>
                <ArrowUpwardIcon style ={{fill:'white'}}/>
              </div>
                <img id = 'logo_img' src = {require('./../../logo.png')} height={'40px'} className= {classes.logo_img}/> {/*selecting logo & positioning it as per user input*/}
                {/* {<div className = {classes.footer}> &#xa9;</div>} page footer */}
                
                {/* Initiating Chart container on outside fullpage container. It is done so to preserve the animations when transistioning from 
                one chart to another */}
                
              </div>
            }
              </div>
        )
    }
}

export default withStyles(styles)(ProjectPage)