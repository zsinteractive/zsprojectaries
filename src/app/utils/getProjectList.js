import $ from 'jquery';

export default async function GetProjectList(apiEnv){
    if(apiEnv === 'dev'){
        var projects = [
            {
                heading: 'Covid-19 card',
                description: 'description goes here',
                config_name: 'config_data_covid'
            },
            {
                heading: 'Capability Card',
                description: 'description goes here',
                config_name: 'config_data_capability'
            }
        ]
        return projects
    } else {
        let configJson;
        // window.getWebAppBackendUrl('project_list')
        // "http://127.0.0.1:8081/project_list"
        let apiOutput = await $.getJSON(window.getWebAppBackendUrl('project_list'), function(output){
            configJson = output.data;
            return configJson;
            })
            .done(function(){console.log('api call was success')})
            .fail(function(e){
                console.log('error encountered: ' + e)
                return(123)
            })
            .always(function(){console.log('api call has completed')})
    return apiOutput.data;
    }
}