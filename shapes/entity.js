//**********************************************************************************************************************************************************
//Entity
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeRTLEntity(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeRTLEntity, mxShape);

mxShapeRTLEntity.prototype.cst = {
		SHAPE_ENTITY : 'mxgraph.rtl.abstract.entity'
};

mxShapeRTLEntity.prototype.customProperties = [
	{name: 'type', dispName: 'Type Symbol', type: 'enum', defVal:'none',
		enumList:[
			{val:'none', dispName:'None'},
			{val:'shiftReg', dispName:'Shift Register'},
			{val:'fifo', dispName:'Fifo / Queue'},
			{val:'ram', dispName:'RAM'},
			{val:'stack', dispName:'Stack'},
			{val:'ringbuffer', dispName:'Ringbuffer'}
		]},
	{name: 'type_loc', dispName: 'Type Symbol Location', type: 'enum', defVal:'topLeft',
		enumList:[
			{val:'topLeft', dispName:'Top Left'},
			{val:'topRight', dispName:'Top Right'},
			{val:'center', dispName:'Center'},
			{val:'bottomLeft', dispName:'Bottom Left'},
			{val:'bottomRight', dispName:'Bottom Right'}
		]},
	{name: 'type_size', dispName: 'Symbol size', type: 'int', min:1, max:1000, defVal:30},
	{name: 'left', dispName: 'Ports left', type: 'int', min:1, max:32, defVal:2},
	{name: 'top', dispName: 'Ports top', type: 'int', min:1, max:32, defVal:1},
	{name: 'right', dispName: 'Ports right', type: 'int', min:1, max:32, defVal:2},
	{name: 'bottom', dispName: 'Ports bottom', type: 'int', min:1, max:32, defVal:1},
	{name: 'clocks', dispName: 'Clock Ports', type: 'int', min:0, max:32, defVal:0},
	{name: 'drawPins', dispName: 'Draw Pins', type: 'bool', defVal:false}
];

/**
* Function: paintVertexShape
* Untitled Diagram.drawio
* Paints the vertex shape.
*/
mxShapeRTLEntity.prototype.paintVertexShape = function(c, x, y, w, h)
{
	window.c = c;
	c.translate(x, y);
	var leftPinNum = parseInt(mxUtils.getValue(this.style, 'left', '2'));
	var rightPinNum = parseInt(mxUtils.getValue(this.style, 'right', '2'));
	var topPinNum = parseInt(mxUtils.getValue(this.style, 'top', '1'));
	var bottomPinNum = parseInt(mxUtils.getValue(this.style, 'bottom', '1'));
	var clockPinNum = parseInt(mxUtils.getValue(this.style, 'clocks', '0'));
	var type = mxUtils.getValue(this.style, 'type', 'none');
	var type_loc = mxUtils.getValue(this.style, 'type_loc', 'topLeft');
	var type_size = mxUtils.getValue(this.style, 'type_size', '30');
	var drawPins = mxUtils.getValue(this.style, 'drawPins', false);
	var padding = drawPins * 10;
	var fontSize = parseFloat(mxUtils.getValue(this.style, 'fontSize', '12'));
	c.setFontSize(fontSize * 0.5);
	var fontColor = mxUtils.getValue(this.style, 'fontColor', '#000000');
	c.setFontColor(fontColor);
	var dir = mxUtils.getValue(this.style, 'direction', 'east');
	var txtRot = 0;

	var selectorPins = 1;
	var operation = 'mux';

	switch(dir)
	{
		case 'south' :
			txtRot = 270;
			break;
		case 'west' :
			txtRot = 180;
			break;
		case 'north' :
			txtRot = 90;
			break;
	}
	
	
	c.begin();
	c.moveTo(padding,padding);
	c.lineTo(w-padding,padding);
	c.lineTo(w-padding,h-padding);
	c.lineTo(padding,h-padding);
	c.close()
	c.fillAndStroke();
	
	if (drawPins) {
		c.begin();
		leftPinY = 0;
		for (var i = 1; i <= leftPinNum + clockPinNum; i++) {
			leftPinY += (h) / (leftPinNum + clockPinNum) / 2;
			c.moveTo(0,leftPinY);
			c.lineTo(padding,leftPinY);
			leftPinY += (h) / (leftPinNum + clockPinNum) / 2;
		}
		rightPinY = 0;
		for (var i = 1; i <= rightPinNum; i++) {
			rightPinY += (h) / rightPinNum / 2;
			c.moveTo(w-padding,rightPinY);
			c.lineTo(w,rightPinY);
			rightPinY += (h) / rightPinNum / 2;
		}
		topPinX = 0;
		for (var i = 1; i <= topPinNum; i++) {
			topPinX += (w) / topPinNum / 2;
			c.moveTo(topPinX,0);
			c.lineTo(topPinX,padding);
			topPinX += (w) / topPinNum / 2;
		}
		bottomPinX = 0;
		for (var i = 1; i <= bottomPinNum; i++) {
			bottomPinX += (w) / bottomPinNum / 2;
			c.moveTo(bottomPinX,h-padding);
			c.lineTo(bottomPinX,h);
			bottomPinX += (w) / bottomPinNum / 2;
		}
	}
	c.stroke();
	c.end();

	c.begin();
	spacing = (h - 2*padding) / (leftPinNum + clockPinNum);
	for (var i = leftPinNum+1; i <= leftPinNum + clockPinNum; i++) {
		leftPinY = padding + i * spacing;
		c.moveTo(padding,leftPinY - 3*spacing/4);
		c.lineTo(padding + spacing/4,leftPinY - spacing/2);
		c.lineTo(padding,leftPinY- spacing/4);
	}
	c.stroke();
	c.end();

	var offsetX = 0;
	var offsetY = 0;
	switch(type_loc) {
		case 'topLeft':
			offsetX = 5 + type_size/2 + padding;
			offsetY = 5 + type_size/2 + padding;
			break;
		case 'topRight':
			offsetX = w - 5 - type_size/2 - padding;
			offsetY = 5 + type_size/2 + padding;
			break;
		case 'center':
			offsetX = w/2;
			offsetY = h/2;
			break;
		case 'bottomLeft':
			offsetX = 5 + type_size/2 + padding;
			offsetY = h - 5 - type_size/2 - padding;
			break;
		case 'bottomRight':
			offsetX = w - 5 - type_size/2 - padding;
			offsetY = h - 5 - type_size/2 - padding;
			break;
		default:
			break;
	};
	
	switch(type) {
		case 'shiftReg':   symbolRTLShiftReg(c,offsetX,offsetY,type_size);   break;
		case 'fifo':       symbolRTLFifo(c,offsetX,offsetY,type_size);       break;
		case 'ram':        symbolRTLRAM(c,offsetX,offsetY,type_size);        break;
		case 'stack':      symbolRTLStack(c,offsetX,offsetY,type_size);      break;
		case 'ringbuffer': symbolRTLRingBuffer(c,offsetX,offsetY,type_size); break;
		case 'none':
		default:
			break;
	};
};

function symbolRTLShiftReg(c,x,y,size) {
	var height = 3*size/5;
	var width = height/2;
	x -= width/2;
	y -= height/2;
	c.begin()
	c.rect(x+width/2,y-height/4,width,height);
	c.fillAndStroke();
	c.rect(x        ,y         ,width,height);
	c.fillAndStroke();
	c.rect(x-width/2,y+height/4,width,height);
	c.fillAndStroke();
	c.end();
}

function symbolRTLFifo(c,x,y,size) {
	var height = 3*size/4;
	var width = height/5;
	c.begin()
	c.moveTo(x-size/2,y-size/4);
	c.lineTo(x-size/2,y-size/2);
	c.lineTo(x+size/2,y-size/2);
	c.lineTo(x+size/2,y-size/4);

	c.moveTo(x-size/2,y+size/4);
	c.lineTo(x-size/2,y+size/2);
	c.lineTo(x+size/2,y+size/2);
	c.lineTo(x+size/2,y+size/4);
	c.stroke();
	
	c.rect(x+size/2-width/4-3*width/2,y-height/2,width,height);
	c.stroke();
	c.rect(x+size/2-width/4-6*width/2,y-height/2,width,height);
	c.stroke();
	c.rect(x+size/2-width/4-9*width/2,y-height/2,width,height);
	c.stroke();
	c.end()
}

function symbolRTLStack(c,x,y,size) {
	var width = 3*size/4;
	var height = width/5;
	c.begin()
	c.moveTo(x-size/4,y-size/2);
	c.lineTo(x-size/2,y-size/2);
	c.lineTo(x-size/2,y+size/2);
	c.lineTo(x+size/2,y+size/2);
	c.lineTo(x+size/2,y-size/2);
	c.lineTo(x+size/4,y-size/2);
	c.stroke();
	
	c.rect(x-width/2,y+size/2-height/4-3*height/2,width,height);
	c.stroke();
	c.rect(x-width/2,y+size/2-height/4-6*height/2,width,height);
	c.stroke();
	c.rect(x-width/2,y+size/2-height/4-9*height/2,width,height);
	c.stroke();
	c.end()
}

function symbolRTLRAM(c,x,y,size) {
	var width = size;
	var height = width/5;
	c.begin()
	c.rect(x-width/2,y-size/2,width,height);
	c.stroke();
	c.rect(x-width/2,y-size/2+height,width,height);
	c.stroke();
	c.rect(x-width/2,y-size/2+2*height,width,height);
	c.stroke();
	c.rect(x-width/2,y-size/2+3*height,width,height);
	c.stroke();
	c.rect(x-width/2,y-size/2+4*height,width,height);
	c.stroke();
	c.end()
	c.begin();
	c.moveTo(x-size/4,y-size/2);
	c.lineTo(x-size/4,y+size/2);
	c.stroke();
	c.end()
}

function symbolRTLRingBuffer(c,x,y,size) {
	var height = 3*size/5;
	var width = height/2;
	x -= width/2;
	y -= size/2;
	c.begin()
	c.rect(x,y,width,height);
	c.fillAndStroke();
	c.rect(x-7*width/8,y+1*size/16,width,height);
	c.fillAndStroke();
	c.rect(x+7*width/8,y+1*size/16,width,height);
	c.fillAndStroke();
	c.rect(x-11*width/8,y+2*size/16,width,height);
	c.fillAndStroke();
	c.rect(x+11*width/8,y+2*size/16,width,height);
	c.fillAndStroke();
	c.rect(x-7*width/8,y+4*size/16,width,height);
	c.fillAndStroke();
	c.rect(x+7*width/8,y+4*size/16,width,height);
	c.fillAndStroke();
	c.rect(x,y+5*size/16,width,height);
	c.fillAndStroke();
	c.end();
}

mxCellRenderer.registerShape(mxShapeRTLEntity.prototype.cst.SHAPE_ENTITY, mxShapeRTLEntity);

mxShapeRTLEntity.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var leftPinNum = parseInt(mxUtils.getValue(this.style, 'left', '2'));
	var clockPinNum = parseInt(mxUtils.getValue(this.style, 'clocks', '0'));
	var rightPinNum = parseInt(mxUtils.getValue(this.style, 'right', '2'));
	var topPinNum = parseInt(mxUtils.getValue(this.style, 'top', '1'));
	var bottomPinNum = parseInt(mxUtils.getValue(this.style, 'bottom', '1'));
	var dir = mxUtils.getValue(this.style, 'direction', 'east');

	var padding = 0;

	leftPinY = padding;
	for (var i = 1; i <= leftPinNum + clockPinNum; i++) {
		leftPinY += (h - 2*padding) / (leftPinNum + clockPinNum) / 2;
		constr.push(new mxConnectionConstraint(new mxPoint(0, (leftPinY)/h), false, 0, 0));
		leftPinY += (h - 2*padding) / (leftPinNum + clockPinNum) / 2;
	}
	rightPinY = padding;
	for (var i = 1; i <= rightPinNum; i++) {
		rightPinY += (h - 2*padding) / rightPinNum / 2;
		constr.push(new mxConnectionConstraint(new mxPoint(1, rightPinY/h), false, 0, 0));
		rightPinY += (h - 2*padding) / rightPinNum / 2;
	}
	topPinX = padding;
	for (var i = 1; i <= topPinNum; i++) {
		topPinX += (w - 2*padding) / topPinNum / 2;
		constr.push(new mxConnectionConstraint(new mxPoint(topPinX/w,0), false, 0, 0));
		topPinX += (w - 2*padding) / topPinNum / 2;
	}
	bottomPinX = padding;
	for (var i = 1; i <= bottomPinNum; i++) {
		bottomPinX += (w - 2*padding) / bottomPinNum / 2;
		constr.push(new mxConnectionConstraint(new mxPoint(bottomPinX/w,1), false, 0, 0));
		bottomPinX += (w -2 *padding) / bottomPinNum / 2;
	}

	return (constr);
}
