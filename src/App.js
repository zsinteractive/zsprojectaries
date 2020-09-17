//importing required libraries
import React from 'react';
import './App.css';
import {Grid, Typography, makeStyles, withStyles} from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ScrollSnap from 'scroll-snap';
import * as Layout from './app/layout';
import {SectionsContainer, Section} from 'react-fullpage'
import "fullpage.js/vendors/scrolloverflow"; // Optional. When using scrollOverflow:true
import ReactFullpage from "@fullpage/react-fullpage";
import * as Container from './app/container';
import PropTypes  from 'prop-types';
import * as d3 from 'd3';
import GetApiData from './app/utils/getApiData';
import ScrollUpButton from "react-scroll-up-button";
//importing user-defined style
import styleJson from './app/styles/root';
// import * as configJson from './app/config_data.json'; //mock data
import clsx from 'clsx';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Particles from 'react-particles-js';
import ProjectList from './app/pages/ProjectList';
import ProjectPage from './app/pages/ProjectPage'
import $ from 'jquery';


//creating style object to attach to class
const styles = theme => (styleJson)

//function to track window sizes
function useWindowSize() {
  const isClient = typeof window === 'object';
  return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined
    }
}


const ChartContext = React.createContext({
  configName: null
})

  // defining App class
  //App class is where magic really starts. It initiates required root level layouts, containers & components
class App extends React.Component{
  //defining state
  constructor(props){
    super(props)
    this.state={
        visibleItem: 0, //Variable to keep track of visible item on screen [Element at position 1 is visible by default]
        configName: 'config_data_capability'
    }
  }
  

  hanldeConfigChange = (config_name) =>{
    this.setState({
      configName: config_name
    })
  }
  
  //render elements
  render(){
    const {classes} = this.props;  //attaching style json to props
    if(this.state.configName === null){
      document.getElementsByTagName('body')[0].style.margin ='0px'
    } else {
      document.getElementsByTagName('body')[0].style.margin = '8px'
    }
    return(
      <div id = 'app_container' style={{height: '100vh', width: '100%', backgroundSize: 'cover', backgroundColor: !this.state.configName?'black':'none'}}>
      {/* <ChartContext.Provider value = {this.state.configName} > */}
      {this.state.configName && <ProjectPage  configName = {this.state.configName} /> }
      {!this.state.configName && 
      <div>
        <Particles
    params={{
	    "particles": {
	        "number": {
	            "value": 50
	        },
	        "size": {
	            "value": 3
	        }
	    },
	    "interactivity": {
	        "events": {
	            "onhover": {
	                "enable": true,
	                "mode": "repulse"
	            }
	        }
	    }
	}} style ={{position:'fixed'}} />
      <ProjectList handleToUpdate = {this.hanldeConfigChange} />
      </div>
      }
      </div>
    )
  }
}

//adding props to App class
App.proTypes = {
  classes: PropTypes.object.isRequired
}
//exporting styled App class
export default withStyles(styles)(App);