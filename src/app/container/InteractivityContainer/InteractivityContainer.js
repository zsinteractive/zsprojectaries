import {SelectInput, RadioButtonGroup} from './../../components/Interactivity'
import React from 'react'

const InteractivityContainer = (props) => {
    var isRadio = props.isRadio;
    return(
        <div>
        {isRadio && <RadioButtonGroup options= {props.options} handleChange = {props.handleChange} label = {props.label}/> }
        {!isRadio && <SelectInput options= {props.options} handleChange = {props.handleChange} label = {props.label}/>}
        </div>
    )
}

export default InteractivityContainer