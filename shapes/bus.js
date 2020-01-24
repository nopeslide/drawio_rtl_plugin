
	// PartialRectangleShape
function mxShapeRTLBus(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

mxUtils.extend(mxShapeRTLBus, mxShape);

mxShapeRTLBus.prototype.cst = {
	SHAPE_BUS : 'mxgraph.rtl.abstract.bus'
};
mxCellRenderer.registerShape(mxShapeRTLBus.prototype.cst.SHAPE_BUS, mxShapeRTLBus);

mxShapeRTLBus.prototype.customProperties = [
	{name: 'left', dispName: 'Ports left', type: 'int', min:1, max:8, defVal:2},
	{name: 'right', dispName: 'Ports right', type: 'int', min:1, max:8, defVal:2}
];


mxShapeRTLBus.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x,y);
	c.begin();
	c.moveTo(0,0);
	c.lineTo(0,h);
	c.moveTo(w,0);
	c.lineTo(w,h);
	c.end();
	c.stroke();
};

mxShapeRTLBus.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var left = parseInt(mxUtils.getValue(this.style, 'left', '2'));
	var right = parseInt(mxUtils.getValue(this.style, 'right', '2'));
	
	spacing = h / (left+1);	
	for (var i = 1; i <= left; i++)
	{
		constr.push(new mxConnectionConstraint(new mxPoint(0, i*spacing/h), false, null, 0, 0));
	}
	spacing = h / (right+1);	
	for (var i = 1; i <= right; i++)
	{
		constr.push(new mxConnectionConstraint(new mxPoint(1, i*spacing/h), false, null, 0, 0));
	}

	return (constr);
}
