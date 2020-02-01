var onml = require('onml');
var render = require('wavedrom/lib');
var def = require('wavedrom/skins/default.js');
var narrow = require('wavedrom/skins/narrow.js');
var lowkey = require('wavedrom/skins/lowkey.js');

/**
* Extends mxShape.
*/
function mxShapeRTLWavedrom(bounds, fill, stroke, strokewidth) {
	mxShape.call(this);
	this.bounds = bounds;
	this.image = '';
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.shadow = false;
};
/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeRTLWavedrom, mxImageShape);

mxShapeRTLWavedrom.prototype.cst = {
	SHAPE_WAVEDROM: 'mxgraph.rtl.abstract.wavedrom'
};

mxShapeRTLWavedrom.prototype.customProperties = [
];

mxShapeRTLWavedrom.prototype.updateImage = function () {
	var skins = Object.assign({}, def, narrow, lowkey);
	var jsonml = render.renderAny(0,JSON.parse(this.state.cell.value),skins);
	jsonml[1].viewBox = "-30 0 "+ jsonml[1].width + " " + jsonml[1].height;
	this.image = 'data:image/svg+xml;base64,' + btoa(onml.stringify(jsonml));
}

/**
* Function: paintVertexShape
* Untitled Diagram.drawio
* Paints the vertex shape.
*/
mxShapeRTLWavedrom.prototype.paintVertexShape = function (c, x, y, w, h) {
	if (!this.image) {
		this.updateImage();
	}
	c.image(x, y, w, h, this.image, this.preserveImageAspect, false, false);
	this.state.cell.valueChanged = (value) => { mxCell.prototype.valueChanged.call(this.state.cell, value); this.updateImage(); this.redraw(); }
}

mxCellRenderer.registerShape(mxShapeRTLWavedrom.prototype.cst.SHAPE_WAVEDROM, mxShapeRTLWavedrom);

mxShapeRTLWavedrom.prototype.getConstraints = function (style, w, h) {
	var constr = [];
	return constr;
}
