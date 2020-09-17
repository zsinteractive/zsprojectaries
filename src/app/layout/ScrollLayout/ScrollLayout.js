import React from 'react';
import Grid from '@material-ui/core/Grid';
import * as Component from '../../components';
import * as Container from '../../container';
// import * as ConfigJson from './../../config_data.json';
import GetApiData from './../../utils/getApiData';
import {Typography, makeStyles, withStyles, Button, IconButton, Icon} from '@material-ui/core';
import {ArrowUpward} from '@material-ui/icons';
import styleJson from './../../styles/root';
import ReactHtmlParser from 'react-html-parser'; 
import ReactPageScroller from 'react-page-scroller';
import clsx from 'clsx';
import $ from 'jquery';
import { easeCubicInOut, easeLinear } from 'd3';
var Pageable = require('pageable')


function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

//importing user defined user style
const styles = theme => (styleJson)

//defining ScrollLayout class
class ScrollLayout extends React.Component{
    //simple constructor 
    constructor(props){
        super(props);
        this.state = {
                visibleItem: 0, // to track visible item
                scrollPosition: 0 // to track position of scroll in the screen [deprecated]
        };
    }

    handler = (propKey) => {
        this.setState({
            visibleItem: propKey
        })
    };
    //adding scroll listener after components are mounted
    componentDidMount(){
        var pages = new Pageable('#onepage', 
        {
            animation: 400,
            swipeThreshold: 100
        }
        )
        window.pageScroll = pages;
        pages.on("scroll.before", data => {
            let layoutConfig = JSON.parse(JSON.stringify(this.props.layoutConfig))
            let lastPageConfig = JSON.parse(JSON.stringify(layoutConfig.filter((el, i) => { return el.pos === -1 })));
            lastPageConfig = lastPageConfig[0]
            let index = (lastPageConfig) && data.index === (this.props.layoutConfig.length-1)?-1:data.index    
            this.props.handleScroll(index)
        })
    
        pages.on('init', data=> {
            let index = parseInt(window.location.href.split('-')[1])
            // debugger
            console.log('index: ' + index)
            // this.handleScrolling(index)
            // let index = (lastPageConfig) && data.index === (this.props.layoutConfig.length-1)?-1:data.index   
            this.props.handleScroll(index)
        })
        
        document.getElementById('super-container').onwheel = function(e){
            console.log('super container scroll event')
            if(e.deltaY > 0){
                pages.next()
            } else if (e.deltaY <0){
                pages.prev()
            }
        }

        document.getElementById('scroll_to_top_button').onclick = function(){
            pages.scrollToPage(1)
        }
      }
      //rendering children components
    render() {
        var ConfigJson = this.props.configJson
        const {classes} = this.props;
        var layoutConfig = this.props.layoutConfig;
        layoutConfig = sortByKey(layoutConfig, 'pos');
        var layoutLen = layoutConfig.length-1;
        var lastPageConfig = JSON.parse(JSON.stringify(layoutConfig.filter((el, i) => { return el.pos === -1 })));
        lastPageConfig = lastPageConfig[0]
        return (
            // making chart descriptions based on user input
            // <div id ='onepage'>
            <React.Fragment>
            <div className = 'component' data-anchor = {'page-0'}>
                <Grid container direction='row' xs={12}  style ={{'height': '100%'}}>
                <Grid item xs = {6} style ={{height: '60vh', marginTop: '12vh'}} direction = 'column'>
                    <Grid item >
                        {ConfigJson.api_data.header_img && <img src = {require('./../../../images/' + ConfigJson.api_data.header_img)} style={{marginLeft:'10vh', width:'80%', marginTop: '86px'}}/>}
                    </Grid>
                    <Grid item>
                        <Typography variant = 'h2' className={classes.heading}>{ReactHtmlParser(ConfigJson.api_data.heading)}</Typography>
                    </Grid>
                    <Grid item>
                        <Typography className={classes.page_subheading} style={{marginTop: '20px', marginLeft: '75px'}}>{ReactHtmlParser(ConfigJson.api_data.title_text)}</Typography>
                    </Grid>
                </Grid>
                <Grid item xs = {6} style ={{'height': '100%'}} direction = 'column'>
                    {/* <img src = 'https://www.virgincare-mywellness.co.uk/content/images/site-loader.gif'></img> */}
                </Grid>
                </Grid>
            </div>
            <React.Fragment>
            {layoutConfig.map(config => {
                if(config.pos === 0 || config.pos === -1) return null
                return (
                // making a scroll snap section. {Class name must be section}
                <div className='component' data-anchor={'page-' + config.pos} > 
                    {/* Defining section layout based on user input.
                        Using bootstrap 12x12 grid system implemented through material-ui to position elements*/}
                    <Grid container xs = {12}  direction = {config.layout === 'right-text'?'row-reverse':'row'}>
                        <Grid item xs={config.layout==='center-top'||config.layout==='center-bottom'?12:4} >
                            {/* Adding scrollElements*/}
                            <Component.ScrollElement value={config.pos} layout={config.layout} header = {config.html.heading} paraText ={config.html.para} footer={config.html.footer} handleChange = {this.handler}/> 
                        </Grid>
                    </Grid>
                </div>
                )
            })}
            </React.Fragment>
            {lastPageConfig && <div className = 'component' data-anchor={'page-' + layoutLen}>
            <Grid container direction='row' xs={12}  style ={{'height': '100%', marginTop: '9vh'}}>
                <Grid item xs = {6} style ={{height: '60vh'}} direction = 'column'>
                    <Grid item>
                        <Typography variant = 'h2' className={classes.heading}>{ReactHtmlParser(lastPageConfig.html.heading)}</Typography>
                    </Grid>
                    <Grid item>
                    {lastPageConfig.html.para.map((htmlString) => {
                        return <Typography className={classes.page_subheading}>{ReactHtmlParser(htmlString)}</Typography>
                    })}
                    </Grid>
                    <Grid item>
                    </Grid>
                </Grid>
                </Grid>
            </div>}
            </React.Fragment>
        );
  }
}

export default withStyles(styles)(ScrollLayout);