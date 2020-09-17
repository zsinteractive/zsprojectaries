import React, { Component } from "react";
import * as d3 from "d3";
import './style.css';
import { hierarchy, tree } from 'd3-hierarchy';
import cat from './cat.png';
import num from './num.png';
import * as cu from "../ChartUtils"

class DecisionTree extends Component {
    componentDidMount() {
        this.drawChart(this.props.data)
    }

    componentDidUpdate() {
        this.drawChart()
    }

    drawChart(dvar) {

        var label_names;

        var TOTAL_SIZE;
        var ttr;
        // var default_colors=[
        //     "#c25975","#d26bff","#2d5a47","#093868","#fcdfe6","#94a2fa","#faec94","#decaee","#daeeca","#b54c0a","#dc1818","#18dcdc","#000000","#340000","#86194c","#fef65b","#ff9b6f","#491b47","#171717","#e8efec","#1c6047","#a2bae0","#4978c3","#f8fee0","#dcfb66","#91fb66","#29663b","#b4b7be","#0088b2","#88b200","#c43210","#f06848","#f0bc48","#d293a2","#cccccc","#59596a","#fafae6","#ffc125","#ff4e50","#f0e6fa","#f6c1c3","#363636"
        // ]

        //************************************* Options******************************************************//

        var version2 = true // if true json from generator_2 will be used


        var tree_branch = false // if the thickness of the branches depend on the value of targt + color * /
        var tree_branch_parent = true //  true: thickness from the root if not the direct parent
        var tree_branch_color = "black"
        var strokeness = 120 //  the degree of separation between the nodes 
        var default_strokeness = 50
        var hover_percent_parent = false // if the display percentage depends on the direct parent or the root
        var square = false
        var rect_percent = true //display the percentage or the value in the small rectangles of the labels 
        var value_percent_top = true /// if we display the value and the percentage above the rectangle /

        var dict_leaf_y = { 1: 0, 2: -17.5, 3: -35, 4: -52.5, 5: -70, 6: -87.5, 6: -105, 7: -122.5, 8: -140, 9: -157.5, 10: -175 }


        var treeData = dvar;

        function getDepth(obj) {
            var depth = 0;
            if (obj.children) {
                obj.children.forEach(function (d) {
                    var tmpDepth = getDepth(d)
                    if (tmpDepth > depth) {
                        depth = tmpDepth
                    }
                })
            }
            return 1 + depth
        }

        TOTAL_SIZE = treeData.size
        var l = treeData.pred.replace(/of/g, "").split(', ')
        for (var j = 0; j < l.length; j++) {
            l[j] = l[j].split(' ')[2]
        }
        label_names = l


        const margin = /*this.props.margin*/{ top: 10, right: 10, bottom: 10, left: 100 };
        const anim_dur = /*this.props.animation*/2000;
        // const transform = d3.zoomIdentity;
        const legendContainer = "#" + this.props.legendContainer;
        const chartContainer = "#" + /*this.props.chartContainer*/"chart-container";

        var width = this.props.width - margin.left - margin.right;
        var height = this.props.height - margin.top - margin.bottom;

        cu.init_svg(chartContainer, legendContainer, margin, width, height)

        var colors = cu.get_color(label_names, false, this.props.defined_colors),
            default_colors = colors.range();

        d3.select(chartContainer).select('svg').select(".trans")
            // .attr("transform", "translate(" + width * 0.5 + "," + height * 0.5 + ")")
            .attr("transform", "translate(" + width * 0.2 + ",0)");
        cu.hideAxes(chartContainer);

        cu.show_legend(legendContainer, label_names, colors)

        var svg = d3.select(chartContainer).select('svg')
            .call(d3.zoom().scaleExtent([1/2, 8]).on('zoom', zoomed))
            // .attr("viewBox", [0, 0, 975, 610])
            .select(".chart")


            
        function zoomed() {
            d3.select(chartContainer).select('svg').selectAll('.trans').attr('transform', d3.event.transform)
        }
        svg.selectAll("*").remove()
        svg.append("g")
            .attr('class', 'meta')
        svg.append("g")
            .attr('class', 'shapes')

        var i = 0,
            duration = 750,
            root;

        // declares a tree layout and assigns the size
        var treemap = d3.tree().size([height, width]);

        // Assigns parent, children, height, depth
        root = d3.hierarchy(treeData, function (d) { return d.children; });
        root.x0 = height / 2;
        root.y0 = 0;

        // Collapse after the second level
        root.children.forEach(collapse);

        update(root, l.length);
        // createLabels(l);

        // Collapse the node and all it's children
        function collapse(d) {
            if (d.children) {
                d._children = d.children
                d._children.forEach(collapse)
                d.children = null
            }
        }

        function update(source, n_labels) {

            // Assigns the x and y position for the nodes
            var treeData = treemap(root);

            // Compute the new tree layout.
            var nodes = treeData.descendants(),
                links = treeData.descendants().slice(1);

            // Normalize for fixed-depth.
            nodes.forEach(function (d) { d.y = d.depth * 180 });

            // ****************** Nodes section ***************************

            // Update the nodes...
            var node = svg.select(".meta").selectAll('g.node')
                .data(nodes, function (d) { return d.id || (d.id = ++i); });

            // Enter any new modes at the parent's previous position.
            var nodeEnter = node.enter().append('g')
                .attr('class', 'node')
                .attr("transform", function (d) {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                })
                .on('click', click);

            // Add Circle for the nodes
            nodeEnter.append('circle')
                .attr('class', 'node')
                .attr('r', 1e-6)
                .style("fill", function (d) {
                    return d._children ? "lightsteelblue" : "#fff";
                });

            function getTextWidth(text, fontSize, fontFace) {
                var a = document.createElement('canvas');
                var b = a.getContext('2d');
                b.font = fontSize + 'px ' + fontFace;
                return b.measureText(text).width;
            }



            var rect = nodeEnter.append("rect")
                .attr("width", 133 + 8)
                .attr("height", 70)
                .attr("x", -80)
                .attr("y", -80)
                .attr("rx", 6)
                .attr("ry", 6)
                .style("fill", function (d) { return (d.children || d._children) || version2 ? "#f0f0f0" : "#ffffff" })
                .style("stroke", function (d) { return (d.children || d._children) || version2 ? "rgb(155, 155, 155)" : "#ffffff" })
                .style("visibility", function (d) { return (d.children || d._children) || version2 ? "visible" : "hidden" })

            nodeEnter.append("svg:image")
                .attr("xlink:href", function (d) { return ((d.children || d._children) || version2) && d.data.type == 'categorical' ? cat : num })
                .attr("x", "-76")
                .attr("y", "-74")
                .attr("width", "20")
                .attr("height", "20")
                .style("visibility", function (d) {
                    if (d.data.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)) {
                        return d.data.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1] == 'Root ' ? 'hidden' : 'visible'
                    }
                    else return (d.children || d._children) || version2 ? "visible" : "hidden"
                });

            nodeEnter.append("text")
                .attr("x", function (d) {
                    var ttr = 13
                    if (default_colors.length > 5) {
                        ttr = (40 * default_colors.length) / 2
                    }
                    return (d.children || d._children) || version2 ? -75 - ((getTextWidth(d.data.size + " / " + (d.data.size * 100 / TOTAL_SIZE).toFixed(0) + "%", 10, 'Verdana') + 5.7) - (133 + 8)) / 2 : ttr
                })
                .attr("y", function (d) {
                    var ttr = dict_leaf_y[label_names.length] - 15
                    if (default_colors.length > 5) {
                        ttr = -20
                    }
                    return (d.children || d._children) || version2 ? -87 : ttr;

                })
                .attr("dy", ".35em")
                .attr("text-anchor", "start")
                .style("font-size", "10px")
                .style("font-family", "Verdana")
                .style("stroke", "#c2c2c2")
                .style("stroke-width", "0.05em")
                .text(function (d) { return true ? d.data.size + " / " + (d.data.size * 100 / TOTAL_SIZE).toFixed(0) + "%" : ""; })
                .attr('visibility', function () {
                    return value_percent_top ? 'visible' : 'hidden'
                })




            nodeEnter.append("text")
                .attr("x", function (d) {
                    if (((d.children || d._children) || version2) && d.data.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1].length <= 11) {
                        return (d.children || d._children) || version2 ? -75 - ((getTextWidth(d.data.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1], 14, 'Verdana') + 5.7) - (133 + 8)) / 2 : 0
                    }
                    else return (d.children || d._children) || version2 ? -75 - ((getTextWidth(d.data.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1].substring(0, 11), 14, 'Verdana') + 5.7) - (133 + 8)) / 2 : 0
                })
                .attr("y", function (d) {
                    if (!d.data.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)) return -65
                    else return d.data.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1] == 'Root ' ? -55 : -65
                })
                .attr("dy", ".35em")
                .attr("text-anchor", "start")
                .style("font-size", "14px")
                .style("font-family", "Verdana")
                .style("stroke", "black")
                .style("stroke-width", "0.05em")

                .text(function (d) {
                    if ((d.children || d._children) || version2) {
                        return d.data.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1].length <= 15 ? d.data.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1] : (d.data.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1]).substring(0, 13) + '..'

                    }
                    else return "";
                })
                .append('svg:title')
                .text(function (d) {
                    return (d.children || d._children) || version2 ? d.data.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1] : ""
                })




            nodeEnter.append("text")
                .attr("x", function (d) { return (d.children || d._children) || version2 ? -75 - ((getTextWidth(d.data.name.replace(d.data.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1], '').replace('=', ''), 14, 'Verdana') + 5.7) - (133 + 8)) / 2 : 0 })
                .attr("y", -45)
                .attr("dy", ".35em")
                .attr("text-anchor", "start")
                .style("font-size", "12px")
                .style("font-family", "Verdana")
                .style("stroke", "black")
                .style("stroke-width", "0.04em")
                .text(function (d) {

                    var toreturn = (d.children || d._children) || version2 ? d.data.name.replace(d.data.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1], '').replace('!=', 'not').replace(/=|\!=/g, '').replace('<', '<=') : "";
                    if (!d.data.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)) return toreturn
                    return d.data.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1] == 'Root ' ? '' : toreturn
                })


            var labels_w = 133 / n_labels
            for (var j = 0; j < n_labels; j++) {
                var curr = j



                nodeEnter.append("rect")
                    .attr("width", function (d) {
                        var v;
                        if (d.data.pred) {
                            v = parseInt(d.data.pred.split(",")[curr].match(/\d+/)[0]) * 133 / d.data.size;
                        }
                        else if (!d.children) {
                            v = 40
                        }

                        if (square) return (d.children || d._children) || version2 ? 133 / label_names.length - 4 : 40
                        else return (d.children || d._children) || version2 ? v : 40
                    })
                    .attr("height", 20)
                    .attr('rx', function (d) { return square ? 0 : 4 })
                    .attr('ry', function (d) { return square ? 0 : 4 })
                    .attr("x", function (d) {

                        var v;
                        var ttl = 0
                        if (curr > 0) {

                            for (var l = 0; l <= curr - 1; l++) {
                                if (d.data.pred) {
                                    v = parseInt(d.data.pred.split(",")[l].match(/\d+/)[0]);
                                }
                                else if (!d.children) v = parseInt(d.data.name.split(",")[l].match(/\d+/)[0]);
                                ttl = ttl + v * 133 / d.data.size
                            }

                        } else {
                            ttl = 0
                        }

                        var ttr = 13
                        if (default_colors.length > 5) {
                            ttr = 10 + j * 45
                        }


                        if (square) return (d.children || d._children) || version2 ? -76 + j * (133 / label_names.length) : ttr
                        else return (d.children || d._children) || version2 ? -76 + ttl : ttr
                    })
                    .attr("y", (function (d) {
                        if (default_colors.length > 5) {
                            return (d.children || d._children) || version2 ? -34 : -10
                        } else return (d.children || d._children) || version2 ? -34 : dict_leaf_y[label_names.length] - 4 + 20 * j + j * 4;
                    }))
                    .style("fill", function (d) {
                        if (default_colors.length == 0) {
                            return default_colors[j]
                        } else {
                            return default_colors[j]
                        }

                    }
                    )
                    .attr('visibility', function (d) {

                        if (d.data.pred) {
                            v = parseInt(d.data.pred.split(",")[curr].match(/\d+/)[0]);
                        }
                        else if (!d.children) v = parseInt(d.data.name.split(",")[curr].match(/\d+/)[0]);
                        var v = v * 133 / d.data.size
                        return v != 0 || !d.children ? "visible" : "hidden"
                    })
                    .attr('opacity', function (d) {
                        var val
                        if (d.data.pred) {
                            val = (parseInt(d.data.pred.split(",")[curr].match(/\d+/)[0]) * 100 / d.data.size).toFixed(0)
                        }
                        else if (!d.children) val = (parseInt(d.data.name.split(",")[curr].match(/\d+/)[0]) * 100 / d.data.size).toFixed(0)
                        return (d.children || d._children) || version2 ? 1 : val / 100 + 0.3

                    })
                    .append("svg:title")
                    .text(function (d) {
                        if (d.data.pred) {
                            return !rect_percent ? d.data.pred.split(",")[curr].match(/\d+/)[0] : (parseInt(d.data.pred.split(",")[curr].match(/\d+/)[0]) * 100 / d.data.size).toFixed(0) + "%"
                        }
                        else if (!d.children) return !rect_percent ? d.data.name.split(",")[curr].match(/\d+/)[0] : (parseInt(d.data.name.split(",")[curr].match(/\d+/)[0]) * 100 / d.data.size).toFixed(0) + "%"

                    })





                var subg = nodeEnter.append("g")
                    .attr("width", labels_w)
                    .attr("height", 20)
                    .attr("x", function (d) {
                        var v;
                        var ttl = 0
                        if (curr > 0) {

                            for (var l = 0; l <= curr - 1; l++) {
                                if (d.data.pred) {
                                    v = parseInt(d.data.pred.split(",")[l].match(/\d+/)[0]);
                                }
                                else if (!d.children) v = parseInt(d.data.name.split(",")[l].match(/\d+/)[0]);
                                ttl = ttl + v * 133 / d.data.size
                            }

                        } else {
                            ttl = 0
                        }

                        return -80 + ttl

                    })
                    .attr("y", -30)


                subg.append("text")
                    .text(function (d) {
                        if (d.data.pred) {
                            return !rect_percent ? d.data.pred.split(",")[curr].match(/\d+/)[0] : (parseInt(d.data.pred.split(",")[curr].match(/\d+/)[0]) * 100 / d.data.size).toFixed(0) + "%"
                        }
                        else if (!d.children) return !rect_percent ? d.data.name.split(",")[curr].match(/\d+/)[0] : (parseInt(d.data.name.split(",")[curr].match(/\d+/)[0]) * 100 / d.data.size).toFixed(0) + "%"

                    })
                    .attr("x", (function (d) {

                        var v;
                        var ttl = 0
                        if (curr > 0) {

                            for (var l = 0; l <= curr - 1; l++) {
                                if (d.data.pred) {
                                    v = parseInt(d.data.pred.split(",")[l].match(/\d+/)[0]);
                                }
                                else if (!d.children) v = parseInt(d.data.name.split(",")[l].match(/\d+/)[0]);
                                ttl = ttl + v * 133 / d.data.size
                            }

                        } else {
                            ttl = 0
                        }

                        var ttr = 18
                        if (default_colors.length > 5) {
                            ttr = 14 + j * 45
                        }

                        if (square) return (d.children || d._children) || version2 ? -71 + j * (133 / label_names.length) : ttr
                        else return (d.children || d._children) || version2 ? -71 + ttl : ttr
                    }))
                    .attr("y", (function (d) {
                        var ttr = dict_leaf_y[label_names.length] + 10 + 20 * j + j * 4
                        if (default_colors.length > 5) {
                            ttr = 5
                        }

                        return (d.children || d._children) || version2 ? -19 : ttr;

                    }))
                    .style("fill", "white")
                    .style("font-size", "12px")
                    .attr('visibility', function (d) {
                        if (d.data.pred && !square) {
                            return (parseInt(d.data.pred.split(",")[curr].match(/\d+/)[0]) * 100 / d.data.size).toFixed(0) > 20 ? "vivible" : "hidden"
                        }
                    })
                    .append("svg:title")
                    .text(function (d) {
                        if (d.data.pred) {
                            return !rect_percent ? d.data.pred.split(",")[curr].match(/\d+/)[0] : (parseInt(d.data.pred.split(",")[curr].match(/\d+/)[0]) * 100 / d.data.size).toFixed(0) + "%"
                        }
                        else if (!d.children) return !rect_percent ? d.data.name.split(",")[curr].match(/\d+/)[0] : (parseInt(d.data.name.split(",")[curr].match(/\d+/)[0]) * 100 / d.data.size).toFixed(0) + "%"

                    })

                subg.append('text')
                    .text(function (d) {
                        if (d.data.pred) {
                            return ''
                        }
                        else if (!d.children) {
                            return label_names[curr]
                        }
                    })
                    .attr("x", (function (d) {
                        var ttr = 60
                        if (default_colors.length > 5) {
                            ttr = 18 + j * 45
                        }
                        return (d.children || d._children) || version2 ? -66 + j * labels_w : ttr
                    }))
                    .attr("y", (function (d) {
                        var ttr = dict_leaf_y[label_names.length] + 10 + 20 * j + j * 4
                        if (default_colors.length > 5) {
                            ttr = 25
                        }
                        return (d.children || d._children) || version2 ? -15 : ttr;
                    }))
                    .style("font-size", "14px")
                    .style("fill", "rgb(78, 74, 74)")
                    .attr('transform', function (d) {

                        return default_colors.length <= 5 ? '' : 'translate(' + (-30 + j * 20) + ',' + (10 + j * (-37)) + ') rotate(55 50 50)'
                    })



            }

            // Chnages are above this
            // UPDATE
            var nodeUpdate = nodeEnter.merge(node);

            // Transition to the proper position for the node
            nodeUpdate.transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            // Update the node attributes and style
            nodeUpdate.select('circle.node')
                .attr('r', 10)
                .style("fill", function (d) {
                    return d._children ? "lightsteelblue" : "#fff";
                })
                .attr('cursor', 'pointer');


            // Remove any exiting nodes
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();

            // On exit reduce the node circles size to 0
            nodeExit.select('circle')
                .attr('r', 1e-6);

            // On exit reduce the opacity of text labels
            nodeExit.select('text')
                .style('fill-opacity', 1e-6);

            // ****************** links section ***************************

            // Update the links...
            var link = svg.select(".meta").selectAll('path.link')
                .data(links, function (d) { return d.id; });

            // Enter any new links at the parent's previous position.
            var linkEnter = link.enter().insert('path', "g")
                .attr("class", "link")
                .attr('d', function (d) {
                    var o = { x: source.x0, y: source.y0 }
                    return diagonal(o, o)
                });

            // UPDATE
            var linkUpdate = linkEnter.merge(link);

            // Transition back to the parent element position
            linkUpdate.transition()
                .duration(duration)
                .attr('d', function (d) { return diagonal(d, d.parent) });

            // Remove any exiting links
            var linkExit = link.exit().transition()
                .duration(duration)
                .attr('d', function (d) {
                    var o = { x: source.x, y: source.y }
                    return diagonal(o, o)
                })
                .remove();

            // Store the old positions for transition.
            nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });

            // Creates a curved (diagonal) path from parent to the child nodes
            function diagonal(s, d) {

                var path = `M ${s.y} ${s.x}
                C ${(s.y + d.y) / 2} ${s.x},
                ${(s.y + d.y) / 2} ${d.x},
                ${d.y} ${d.x}`

                return path
            }

            // Toggle children on click.
            function click(d) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                update(d, n_labels);
            }
        }

        function createLabels(labels) {


            var Size = 400


            var svg1 = d3.select("body")
                .append("svg")
                .attr("width", Size)
                .attr("height", Size)
                .attr("class", "legends");

            default_colors = default_colors.slice(0, labels.length)
            if (default_colors.length == 2) default_colors.push('')
            if (default_colors.length == 0) {
                var c_l = default_colors
            } else {
                var c_l = default_colors
            }

            for (i = 0; i < c_l.length; i++) {

                var legendG = svg1
                    .append("g")
                    .attr("transform", function (d) {
                        return "translate(" + 0 + "," + (30 * i + Size / 33 + Size / 50) + ")"; // place each legend on the right and bump each one down 15 pixels
                    })
                    .attr("class", "legend");

                legendG.append("rect") // make a matching color rect
                    .attr("width", 15)
                    .attr("height", 15)
                    .attr("fill", c_l[i])
                    .style('visibility', function () {
                        return labels[i] ? "visible" : "hidden"
                    })

                legendG.append("text") // add the text
                    .text(labels[i])
                    .style("font-size", 20)
                    .attr("y", 12)
                    .attr("x", 21)

            }

        }


    }

    render() {
        return <div></div>
    }

}

export default DecisionTree;
