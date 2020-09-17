import React from 'react';
import {Radio, RadioGroup, FormControl, FormControlLabel, FormLabel, withStyles, makeStyles} from '@material-ui/core';
import { RadioButton } from 'material-ui';
import styleJson from './../../styles/root';
import { render } from '@testing-library/react';


const classes = makeStyles(styleJson);

class RadioButtonsGroup extends React.Component {
    constructor(props){
      super(props)
      this.value = null
    }

    handleChange = (event) => {
     this.value = event.target.value
    this.props.handleChange(event.target);
    };

    componentWillMount(){
      this.value = this.props.options[0].value
    }

  componentWillReceiveProps(next) {
    if(next.options.join('') === this.props.options.join('')) return null;
    this.value = null
  }
   render(){ 
    var options = this.props.options; 
    return (
      <FormControl component="fieldset">
        <FormLabel component="legend" style = {{fontFamily: 'Roboto Bold', fontSize: '19px', color: 'black', marginBottom: '3px'}}>{this.props.label}</FormLabel>
        <RadioGroup row aria-label="gender" name="gender1" value={this.value} onChange={this.handleChange} >
          {
              options.map(obj=> {
                  return(
                      <FormControlLabel value = {obj.value} control = {<Radio  />} label = {obj.label} classes = {{body: classes.form_text}} />
                  )
              })
          }
        </RadioGroup>
      </FormControl>
  );}
}

export default RadioButtonsGroup;
