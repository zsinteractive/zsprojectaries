// These properties cannot be changed by user. [Only meant for developer]
export default {
  //classes for paragraph div in various layouts
    "side_para": {
      maxHeight: '60vh', 
      height: 'fit-content', 
      overflow: 'auto',  
      paddingRight: '1%'
    },
    "top_para": {
      maxHeight: '14vh', 
      height: 'fit-content', 
      overflow: 'auto',
      paddingRight: '1%'
    },
    "bottom_para": {
      maxHeight: '14vh', 
      height: 'fit-content', 
      overflow: 'auto',
      paddingRight: '1%'
    },
    "scroll_element_invisible": {
        zIndex: 1000,
        position: 'relative',
        marginLeft: '5vh',
        marginRight: '5vh',
        width: '100%',
        fontFamily: "Segoe",
        fontWeight: 400,
        textAlign: 'justify',
        padding: '10px',
        opacity: 0.8
      },
      "scroll_element": {
        marginLeft: '5vh',
        marginRight: '5vh',
        top: '9vh',
        // display: 'flex',
        height: '80vh',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1000,
        width: '100%',
        fontFamily: "Segoe",
        fontWeight: '400',
        textAlign: 'justify'
      },
      
      "scroll_element_right": {
        marginLeft: '-10vh',
        marginRight: '5vh',
        top: '9vh',
        position: 'relative',
        // display: 'flex',
        height: '80vh',
        flexDirection: 'column',
        zIndex: 1000,
        width: '100%',
        fontFamily: "Segoe",
        fontWeight: '400',
        textAlign: 'justify'
      },
      "scroll_element_first": {
        marginLeft: '5vh',
        marginRight: '5vh',
        position: 'relative',
        zIndex: 1000,
        width: '100%',
        fontFamily: "Segoe",
        fontWeight: '400',
        textAlign: 'justify',
        height: '100%'
      },
      "scroll_element_center_top": {
        marginLeft: '5vh',
        marginRight: '8vh',
        top:'4vh',
        zIndex: 1000,
        position: 'relative',
        maxHeight: '26vh',
        height: 'fit-content',
        marginBottom: '70vh',
        fontFamily: "Segoe",
        fontWeight: '400',
        textAlign: 'justify'
      },
      "scroll_element_center_bottom": {
        marginLeft: '5vh',
        marginRight: '5vh',
        padding: '10px',
        zIndex: 1000,
        marginTop: '66vh',
        fontFamily: "Segoe",
        fontWeight: '400',
        textAlign: 'justify',
        maxHeight: '23vh',
        height: 'fit-content'
      },
      "chart_container_right":{
        position: 'fixed', 
        left:'40%', 
        marginTop:0, 
      },
      "chart_container_left":{
        position: 'fixed', 
        left: '5%', 
        marginTop:0,
      }

}