function Layout(el) {
    this.svg = svg = svg = d3.select(el);
    try {
        var width = el.clientWidth,
            height = el.clientHeight;
        var c = cola.d3adaptor(d3)
            .linkDistance(200)
            .avoidOverlaps(true)
            .handleDisconnected(true)
            .size([width, height]);
        c.nodes(graphView.graph.nodes)
            .links(graphView.graph.links)
            .groups(graphView.graph.groups);
        c.start();

        svg.append("defs").append("marker")
            .attr("id", "Harpoon")
            .attr("viewbox", "0 0 20 20")
            .attr("refX", 20)
            .attr("refY", 20)
            .attr("markerWidth", 40)
            .attr("markerHeight", 40)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0,0 40,20 0,40 20,20 Z");

        svg.append("defs").append("marker")
            .attr("id", "Upside-down-harpoon")
            .attr("viewbox", "0 0 20 20")
            .attr("refX", 20)
            .attr("refY", 20)
            .attr("markerWidth", 40)
            .attr("markerHeight", 40)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0,20 40,40 20,20 40,0 Z");


        var group = svg.selectAll(".group interactor")
            .data(graphView.graph.groups)
            .enter().append("rect")
            .attr("rx", 5).attr("ry", 5)
            .attr("class", "interactor")
            .call(c.drag);

        var pad = styles.padding;

        var node = svg.selectAll(".node")
            .data(graphView.graph.nodes)
            .enter().append("g")
            .attr("class", function(d) {
                return "node " + d.constructor.name + " " + d.cid;
            }).attr("width", function(d) {
                return d.width - 2 * pad;
            })

            .attr("height", function(d) {
                return (d.height - 2 * pad) * 4;
            })
            .call(c.drag).on('mouseup', function(d) {
                d.fixed = 0;
                c.alpha(1); // fire it off again to satify gridify
            });


        var label = svg.selectAll(".label")
            .data(graphView.graph.nodes)
            .enter().append("text")
            .attr("class", function(d) {
                if (d.constructor.name == "Label") {
                    return "label";
                } else {
                    return "node";
                }
            })
            .text(function(d) {
                return d.name;
            })
            .call(c.drag);



        var rect = node.selectAll(".Node").append("rect")
            .attr("width", function(d) {
                return d.width - 2 * pad;
            })
            .attr("height", function(d) {
                return (d.height - 2 * pad) * 4;
            })
            .call(c.drag).on('mouseup', function(d) {
                d.fixed = 0;
                c.alpha(1); // fire it off again to satify gridify
            });

        var link = svg.selectAll(".link")
            .data(graphView.graph.links)
            .enter().append("line")
            .attr("class", "link")
            .attr("marker-start", "url(#Upside-down-harpoon)")
            .attr("marker-end", "url(#Harpoon)").call(c.drag);

        var binding =
            svg.selectAll(".BindingSite")
            .append("g");
        var bindingborder = binding.append("rect");


        //uois - e.g ct:bind
        var uoig = binding.append("g").attr("class", "uoig");
        var uoirect = uoig.append("rect");
        var uoitext = uoig.attr("class", "uoi")
            .append("text")
            .text(function(d) {
                return d.uoi.info;
            })
            .call(c.drag);

        // location variable
        var locg = binding.append("g");
        var locrect = locg.append("rect");
        var locationOfBinding =
            locg.append("text")
            .attr("class", "position")
            .text(function(d) {
                return d.position.info;
            })
            .call(c.drag);

        c.on("tick", function() {
            link.attr("x1", function(d) {
                    return d.source.x;
                })
                .attr("y1", function(d) {
                    return d.source.y;
                })
                .attr("x2", function(d) {
                    return d.target.x;
                })
                .attr("y2", function(d) {
                    return d.target.y;
                });

            label.attr("x", function(d) {
                    d.height = this.getBBox().height;
                    d.width = this.getBBox().width;
                    return d.x - d.width / 2 + pad;
                })
                .attr("y", function(d) {
                    var h = this.getBBox().height;
                    return d.y + h / 4 - pad;
                });

            bindingborder.attr("x", function(d) {
                    return d.x - this.getBBox().width / 2;
                })
                .attr("y", function(d) {
                    return d.y - d.height*1.5;
                }).attr("height", function(d) {
                  //we can't just get the parent bbox size because i grows endlessly bigger with each iteration.
                  //instead, calculate the height based on the two child groups which formthe top and bottom of the group
                  var childnodes = this.parentNode.querySelectorAll("g");
                    var h = childnodes[0].getBBox().y - childnodes[1].getBBox().y;
                    //HERE WE NEED TO SET THE HEIGHT OF THE DOODAD
                    return h;
                }).attr("width", function(d) {
                    d.width = this.parentNode.getBBox().width;
                    return this.parentNode.getBBox().width;
                });

            uoig.attr("x", function(d) {
                    return d.x - this.getBBox().width / 2;
                })
                .attr("y", function(d) {
                    var h = this.getBBox().height;
                    return d.y + h;
                }).attr("height", "20").attr("width", function(d) {
                    return this.getBBox().width
                });

            uoitext.attr("x", function(d) {

                    return d.x - this.getBBox().width / 2;
                })
                .attr("y", function(d) {
                    var h = this.getBBox().height;
                    return d.y + h;
                }).attr("height", "20").attr("width", function(d) {
                    return this.getBBox().width
                });

            uoirect.attr("x", function(d) {

                    return d.x - this.getBBox().width / 2;
                })
                .attr("y", function(d) {
                    var h = this.getBBox().height;
                    return d.y + (h / 4);
                }).attr("height", "20").attr("width", function(d) {
                    return this.parentNode.getBBox().width
                });



            locationOfBinding.attr("x", function(d) {
                    return d.x - this.getBBox().width / 2;
                })
                .attr("y", function(d) {
                    var h = this.getBBox().height;
                    return d.y - h;
                }).attr("height", 2).attr("width", 20)

            locrect.attr("x", function(d, f, g) {
                    return d.x - this.getBBox().width / 2 + pad;
                })
                .attr("rx", "10")
                .attr("ry", "10")
                .attr("y", function(d) {
                    var h = this.getBBox().height;
                    return d.y + -h * 2;
                }).attr("height", function(d) {
                    return d.height;
                }).attr("width", function(d) {
                    return this.parentNode.getBBox().width;
                })




            rect.attr("x", function(d) {
                    return d.x - d.width / 2 + pad;
                })
                .attr("y", function(d) {
                    return d.y - pad * 4 - (d.height / 2);
                })
                .attr("width", function(d) {
                    return d.width;
                })
                .attr("height", function(d) {
                    return d.height * 2;
                });;

            group.attr("x", function(d) {
                    return d.bounds.x;
                })
                .attr("y", function(d) {
                    return d.bounds.y;
                })
                .attr("width", function(d) {
                    return d.bounds.width();
                })
                .attr("height", function(d) {
                    return d.bounds.height();
                });


        });
    } catch (e) {
        console.log("%ce", "color:cornflowerblue;font-family:sans-serif;", e);
    }
    return this;
}

function updateParent() {

}
