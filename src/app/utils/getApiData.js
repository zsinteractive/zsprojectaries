import $ from 'jquery';

export default async function GetApiData(apiEnv, configName){
    let configJson
    // if(apiEnv === 'dev'){
        if(configName === 'config_data_covid'){
            configJson = require('./../mock_data/config_data_y1.json') 
        } else if(configName === 'config_data_capability'){
            configJson = require('./../mock_data/config_data_y1.json')
        }
        return configJson;
    // } 
}