export default function filterChartData(config, filterColumn, filterValue){
    if(filterValue === null) return(config);
    var data = config[0].data;
    var new_data = data.filter(function(i, n){
        return i[filterColumn] == filterValue
    })
    config[0].data = new_data;
    return(config);
}