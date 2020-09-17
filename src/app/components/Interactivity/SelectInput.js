// import Select from 'react-select';
import React from 'react';
import styleJson from './../../styles/root';
import {withStyles} from '@material-ui/core';
import { object } from 'underscore';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
const _ = require('underscore');


const styles = theme => (styleJson)

class SelectInput extends React.Component{
    constructor(props){
        super(props)
        this.id = _.uniqueId('selectInput')
        this.selectedOption= null
        this.options = this.props.options
    }

    handleInputChange = (e) => {
        if(!e.target.outerText || e.target.outerText === '') return null
        this.selectedOption = e.target.outerText
        var val = this.options.filter(el => {
            return el.label.trim() === e.target.outerText.trim()
        })[0]
        var selectedOption = {value: val.value}
        this.props.handleChange(selectedOption)
    }

    componentWillMount(){
        this.selectedOption = this.props.options[0].label
    }

    componentWillReceiveProps(next){
        if(next.options.join('') === this.props.options.join('')) return null;
        this.selectedOption= next.options[0].label
    }

    render(){
        const {classes} = this.props;
        const id = this.id;
        // const {selectedOption} = this.state
        return(
            <div>
            {/* <FormControl style ={{width: '200px'}}>
                <InputLabel id = 'input-label-dropdown'>{this.props.label}</InputLabel>
                <Select labelId = 'input-label-dropdown'
                    id={this.id}
                    value={this.selectedOption}
                    onChange = {this.handleInputChange}
                >
                    {this.props.options.map(obj => {
                        return <MenuItem value = {obj.value}>{obj.label}</MenuItem>
                    })}
                </Select>
            </FormControl> */}
             <Autocomplete
                style={{width: '200px', height: '10px'}}
                id="free-solo-demo"
                debug
                options={this.props.options.map((obj) => obj.label)}
                onChange={this.handleInputChange}
                value = {this.selectedOption}
                renderInput={(params) => (
                <TextField {...params} label= {this.props.label}  margin="normal" />
                
        )}
      />
            </div>
        )
    }
}

export default withStyles(styles)(SelectInput)