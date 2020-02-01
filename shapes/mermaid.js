var mermaid = require('mermaid');
mermaid.mermaidAPI.initialize({
  startOnLoad:false
});

/**
* Extends mxShape.
*/
function mxShapeRTLMermaid(bounds, fill, stroke, strokewidth) {
	mxShape.call(this);
	this.bounds = bounds;
	this.image = '';
	this.mermaidOutput = '';
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.shadow = false;
};
/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeRTLMermaid, mxImageShape);

mxShapeRTLMermaid.prototype.cst = {
	SHAPE_MERMAID: 'mxgraph.rtl.abstract.mermaid'
};

mxShapeRTLMermaid.prototype.customProperties = [
];

mxShapeRTLMermaid.prototype.updateImage = function () {
	if (!document.querySelector("#mermaid")) {
		var element = document.createElement("svg");
		element.setAttribute("style","display:none;");
		element.setAttribute("id","mermaid");
		document.body.appendChild(element);
	}
	mermaid.mermaidAPI.render('mermaid',this.state.cell.value, (svg) => { this.mermaidOutput = svg; });
	this.image = 'data:image/svg+xml;base64,' + btoa(this.mermaidOutput);
}

/**
* Function: paintVertexShape
* Untitled Diagram.drawio
* Paints the vertex shape.
*/
mxShapeRTLMermaid.prototype.paintVertexShape = function (c, x, y, w, h) {
	c.root.setAttribute('id','123');
	if (!this.image) {
		this.updateImage();
	}
	c.image(x, y, w, h, this.image, this.preserveImageAspect, false, false);
	this.state.cell.valueChanged = (value) => { mxCell.prototype.valueChanged.call(this.state.cell, value); this.updateImage(); this.redraw(); }
}

mxCellRenderer.registerShape(mxShapeRTLMermaid.prototype.cst.SHAPE_MERMAID, mxShapeRTLMermaid);

mxShapeRTLMermaid.prototype.getConstraints = function (style, w, h) {
	var constr = [];
	return constr;
}
