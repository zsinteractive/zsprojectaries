import * as configJson from '../../config_data.json';

var layoutConfig = configJson.api_data.data;

export default function getPosition(pos, scrollPos, startPos, dir){
    
        var config1 = layoutConfig.filter((el, i) => {return el.pos === pos})
        config1 = config1.length !== 0? config1[0]: config1;
        var layout1 = config1.layout;
        if(pos ===1 ){
            if(layout1 === 'right-text') return(5)
            else if(layout1 === 'left-text') return(40)
        }
        if(pos !== 1){
            var config2 = layoutConfig.filter((el, i) => {return el.pos === (pos -1)})
            config2 = config2.length !== 0? config2[0]: config2;
            var layout2 = config2.layout;
            if(layout1 === 'left-text' && layout2 === 'left-text'){
                return(40)
            } else if(layout1 === 'right-text' && layout2 === 'right-text'){
                return(5)
            } else if(layout1 === 'left-text' && layout2 === 'right-text'){
                var margin = 5 + 0.1259*(scrollPos-startPos)
                if(margin > 40) margin = 40
                return(margin)
            } else if(layout1 === 'right-text' && layout2 === 'left-text'){
                var margin = 40 - 0.1259*(scrollPos-startPos)
                if(margin < 5) margin = 5;
                return(margin)
            }
        }
}