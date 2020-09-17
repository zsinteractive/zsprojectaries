import React from 'react';
import AliceCarousel from 'react-alice-carousel';
import {Paper, Grid,Button} from '@material-ui/core';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import GetProjectList from './../utils/getProjectList';
import ReactLoading from "react-loading";
import $ from 'jquery';
import 'react-alice-carousel/lib/alice-carousel.css';

 
class ProjectList extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            projects: null
        }
    }
    
    componentDidMount(){
        $(document).ready(function(){
          $('#jugad_button_PL').click()
      })
      }

    render() {
      const responsive = {
        0: {
          items: 1
        },
        600: {
          items: 3
        },
        1024: {
          items: 6
        }
      };
      return (
        <div id = 'project_list_page' >
        {!this.state.projects && 
            <div>
            <Button id = 'jugad_button_PL' onClick = {async () =>{
                let apiOutput = await GetProjectList(process.env.REACT_APP_ENV)
                this.setState({
                    projects: apiOutput
                })
                }}>
            </Button>
            <div style ={{marginTop: '20vh', marginLeft: '90vh'}}>
                <ReactLoading type={'bars'} color={"gray"} heigh={'20%'} width={'20%'} />
            </div>
            </div>
            }
        {this.state.projects && <Grid container direction= 'column' style={{marginLeft: '8px'}}>
                <Grid item style={{marginTop: '10%', marginBottom: '1%'}}><h1 style={{display:'inline', color:'white', fontSize:'32px'}}>Pfizer Interactive Viz Services: Interactive Storytelling</h1></Grid>
                <Grid item style={{ marginBottom: '1%'}}><h2 style={{display: 'inline', color:'white'}}>Projects</h2> <ArrowForwardIosIcon /></Grid>
                <Grid container>
                {/* <div style = {{height: '100%', width:'fit-content'}}><ArrowForwardIosIcon style={{margin:'auto'}}/></div> */}
                    <AliceCarousel
                    startIndex = {0}
                    fadeOutAnimation={true}
                    mouseDragEnabled={true}
                    dotsDisabled= {true}
                    responsive={responsive}
                    infinite = {false}
                    //   buttonsDisabled = {true}
                    onSlideChange={this.onSlideChange}
                    onSlideChanged={this.onSlideChanged}
                    //   playButtonEnabled = {true}
                    >{
                        this.state.projects.map(obj => {
                        return(
                        <Paper style = {{width: '200px', padding: '15px', cursor: 'pointer', opacity:'0.8'}} onClick= {()=>{
                            this.props.handleToUpdate(obj.config_name)
                        }}>
                            
                                <Grid container>
                                    <h2>{obj.heading}</h2>
                                    <p>{obj.description}</p>
                                </Grid>
                            </Paper> )
                        })
                    }
                </AliceCarousel>
                {/* <div style = {{height: '100%', width:'fit-content'}}><ArrowForwardIosIcon style={{margin:'auto'}}/></div> */}
            </Grid>
            </Grid>
        }
        </div>
      );
    }
}

  export default ProjectList;