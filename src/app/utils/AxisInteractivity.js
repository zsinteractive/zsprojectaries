export default function MakeAxis(config, xAxis, yAxis){
    var data = config[0].data;
    data = data.map(obj => {
        obj.x_axis = obj[xAxis];
        obj.y_axis = obj[yAxis];
        delete obj[xAxis];
        delete obj[yAxis]
        return(obj)
    })
    data = data.filter(function(obj){
        return obj.x_axis !== undefined && obj.y_axis !== undefined;
    })
    config[0].data = data;
    return(config)
}