var render = require('bit-field/lib/render');
var onml = require('onml');
/**
* Extends mxShape.
*/
function mxShapeRTLBitfield(bounds, fill, stroke, strokewidth) {
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};
/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeRTLBitfield, mxShape);

mxShapeRTLBitfield.prototype.cst = {
	SHAPE_BITFIELD: 'mxgraph.rtl.abstract.bitfield'
};

mxShapeRTLBitfield.prototype.customProperties = [
	{ name: 'vspace', dispName: 'Vertical Space', type: 'int', min: 1, max: 2000, defVal: 80 },
	{ name: 'hspace', dispName: 'Horizontal Space', type: 'int', min: 1, max: 2000, defVal: 320 },
	{ name: 'lanes', dispName: 'Number of Lanes', type: 'int', min:1, max:1024, defVal: 1 },
	{ name: 'bits', dispName: 'Number of Fields', type: 'int', min:1, max:1024, defVal: 8 },
	{ name: 'compact', dispName: 'Compact', type: 'boolean', defVal: false },
	{ name: 'bigendian', dispName: 'Big Endian', type: 'boolean', defVal: false },
];

/**
* Function: paintVertexShape
* Untitled Diagram.drawio
* Paints the vertex shape.
*/
mxShapeRTLBitfield.prototype.paintVertexShape = function (c, x, y, w, h) {
	var vspace = parseInt(mxUtils.getValue(this.style, 'vspace', '80'));
	var hspace = parseInt(mxUtils.getValue(this.style, 'hspace', '320'));
	var lanes  = parseInt(mxUtils.getValue(this.style, 'lanes', '1'));
	var bits   = parseInt(mxUtils.getValue(this.style, 'bits', '8'));
	var compact = mxUtils.getValue(this.style, 'compact', false);
	var bigendian = mxUtils.getValue(this.style, 'bigendian', false);

	var options = {
		vspace:vspace,
		hspace:hspace,
		lanes:lanes,
		bits:bits,
		compact:compact,
		bigendian:bigendian,
		fontsize:this.style.fontSize,
		fontfamily:this.style.fontFamily,
	}

	var jsonml = render(JSON.parse(this.state.cell.value),options);
	jsonml[0] = "g";
	var scale = Math.min(w/jsonml[1].width,h/jsonml[1].height) * c.state.scale;
	jsonml[1] = {};
	jsonml[1].transform="translate("+x*c.state.scale+","+y*c.state.scale+") scale("+scale+","+scale+")";
	this.node.innerHTML = onml.stringify(jsonml);
}

mxCellRenderer.registerShape(mxShapeRTLBitfield.prototype.cst.SHAPE_BITFIELD, mxShapeRTLBitfield);

mxShapeRTLBitfield.prototype.getConstraints = function (style, w, h) {
	var constr = [];
	return constr;
}
