// Importing required libraries & modules
import React from 'react';
import {Grid, Button} from '@material-ui/core';
import {ArrowUpward} from '@material-ui/icons';
import VisibilitySensor from 'react-visibility-sensor';
import styleJson from './../../styles/styles';
import clsx from 'clsx';
import ReactHtmlParser from 'react-html-parser'; 
import { makeStyles } from '@material-ui/core';
import { html } from 'd3';
//Importing user defined style json
import definedStyle from './../../styles/root';

//Initiating ScrollElement 
const ScrollElement = (props) => {
    //creating styles object using material ui
    const useStyles = makeStyles(styleJson);
    const classes = useStyles();
    const useUserDefinedStyles = makeStyles(definedStyle);
    const userDefinedClasses = useUserDefinedStyles()

    return(
        // ScrollElement contains chart heading, paragraphs etc & changes classes based on its layout.
        //Dynamic classes are provided at runtime through clsx package [the classes cannot be overwritten at front-end]
                <div className = {clsx({
                    [classes.scroll_element]: props.layout === 'left-text',
                    [classes.scroll_element_right]: props.layout === 'right-text',
                    [classes.scroll_element_center_top]: props.layout === 'center-top',
                    [classes.scroll_element_center_bottom]: props.layout === 'center-bottom'
                })} item xs = {12}>
                    {/* Text is expected in html format. However, ReactHtmlParser works fine for simple string as well.
                     UserDefined classes */}
                    <h2 className = {userDefinedClasses.chart_heading}>{ReactHtmlParser(props.header)}</h2>
                    <div id = {'para_div_' + props.value} className = {clsx({
                        [classes.side_para]: (props.layout === 'left-text' || props.layout === 'right-text'),
                        [classes.top_para]: props.layout == 'center-top',
                        [classes.bottom_para]: props.layout === 'center-bottom'
                    })
                    }>
                    {
                        props.paraText.map(htmlString => {
                            return(<p className={userDefinedClasses.para}>{ReactHtmlParser(htmlString)}</p>)
                        })   
                    }
                    </div>
                    <div xs = {12} item className={clsx({
                        [userDefinedClasses.chart_footer]: props.layout !== 'center-bottom',
                        [userDefinedClasses.chart_footer_center_bottom]: props.layout === 'center-bottom'
                    })}>{ReactHtmlParser(props.footer)}</div>
                    {<div xs = {12} item id={'legend_container_' + props.value} style={{ height: 'fit-content', maxHeight:'17vh', marginTop: (props.chartType === 'heat_map' || props.chartType === 'choropleth_chart')?'6vh':'3vh', marginBottom: 'auto', overflow: 'auto' }}></div>}
                    
                </div>
    )
}

export default ScrollElement;