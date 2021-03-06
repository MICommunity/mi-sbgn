import UnitOfInformation from './UnitOfInformation';
import StateVariable from './StateVariable';
import Maths from './../Maths';

export default function BindingSite(model, graphView) {
  this.model = model;
  this.name = "binding region";
  this.cid = this.model.cid;
  this.graphView = graphView;

  this.graphView.addNode(this);

  this.uoi = new UnitOfInformation("binding");
  this.position = new StateVariable(model.get("pos"));
  return this;
}

BindingSite.prototype.getCenterX = function () {
  var bb = this.node.getBBox();
  return bb.x + bb.width / 2;
}

BindingSite.prototype.getCenterY = function () {
  var bb = this.node.getBBox();
  return bb.y + bb.height / 2;
}

BindingSite.prototype.getArrowTarget = function (line, previousLine, prevlinecoord) {
  return Maths().boxLineIntersection(this, line, previousLine, prevlinecoord);
}

BindingSite.prototype.addLinks = function () {
  //find links and add them.
  var links = this.model.get("feature").get("linkedFeatures"),
    parent = this;
  links.models.map(function (linkedFeature) {
    var bindingRegions = linkedFeature.get("sequenceData");
    if (bindingRegions) {
      bindingRegions.map(function (region) {
        parent.graphView.addLink(parent.model.cid, region.cid);
      });
    } else {
      console.error("%c something went wrong with the link for", "color:orange;", this);
    }
  });
}

BindingSite.prototype.toXML = function () {
  var parent = this;
  return jstoxml.toXML({
    _name: 'glyph',
    _attrs: {
      id: parent.model.cid,
      class: "entity"
    },
    _content: [{
        _name: "label",
        _attrs: {
          "text": "binding region"
        }
      },
      {
        _name: "bbox",
        _attrs: parent.graphView.boundsToSBGNCoords(parent.bounds)
      },
      parent.uoi.toXML(),
      parent.position.toXML(parent.bounds.y)
    ]

  });
}