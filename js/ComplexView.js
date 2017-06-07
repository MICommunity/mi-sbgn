var ComplexView = Backbone.View.extend({
    className: "sbgnContainer",
    initialize: function() {
        this.interactors = this.model.attributes.interactors.models;
        this.participants = [];
        this.render();
        this.listenTo(this.model, "change", this.render);
    },
    updateOutline: function() {
        var bb = this.node.getBBox();
        //cola sometimes gives us negative margins for some reason, but we don't
        //want the layout to be offscreen! that's weird. So we'll
        //translate it back in to the screen
        setAttr(this.node, "transform", "translate(" + Math.abs(bb.x) + "," + Math.abs(bb.y) + ")");

    },
    empty : function(){
      this.$el.html("");
      this.node = null;
    },
    render: function() {
        this.node = createElem("g");
        this.el.appendChild(this.node);

        try {
          //first we create all the elements, but we don't know
          //their layout.
            this.instantiateParticipants();
            //we use cola to calculate layour based on the side of
            //the elements, then update the positions.
            this.updatePositions();
            this.expandToFitParent();

            //links are rendered last after all the positioning
            //nitty gritty is done
        } catch (e) {
            console.error("%cerror", "background-color:firebrick; color:#eee;font-weight:bold;", e);
        }
        return this;
    },
    expandToFitParent : function(){
      var bb = this.el.getBBox();
      this.$el.attr("viewBox", "0 0 " + (bb.width + 10) + " " + (bb.height + 10));
    },
    renderLinks : function(){
      this.links = [];
      var parent = this;
      graphView.graph.links.map(function(link){
        var l = new Link(link).node;
        parent.links.push(l);
        parent.node.appendChild(l);
      });
    },
    instantiateParticipants: function() {
        var parent = this;
        this.model.get("interactions").at(0).get("participants").map(function(participant) {
            var newParticipant = new Participant(participant);
            parent.node.appendChild(newParticipant.node);
            parent.participants.push(newParticipant);
            graphView.addNode(newParticipant);
        });

    },
    updatePositions : function() {
      //first we describe the conceptual graph links (not rendered)
      graphView.addLinks();

      //now we store the sizes of the nodes so cola can calculate
      //layour for us
      graphView.updateNodeSizes();

      //now we provide all of our layout details to cola and it
      //returns the x and y of each node.
      var newLayout = layout(graphView.graph.nodes, graphView.graph.links, graphView.groups);
      newLayout.nodes().map(function(node) {
          //here we're iteratin through the results from cola and
          //drawing the locations on the graph.
          node.setLocation(node.x, node.y);
      });

      // once we have the layout, we can draw the outlines of the participants
      // each outline requires knowing the x and y of the layout
      // so it can't be drawn any earlier.
      this.participants.map(function(participant) {
          participant.updateOutlines();
      });

      this.renderLinks();
      this.updateOutline();
    }
});