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
	{name: 'kind', dispName: 'Type', type: 'enum', defVal:'sequential',
		enumList:[
			{val:'sequential', dispName:'Seq. Logic'},
			{val:'combinational', dispName:'Comb. Logic'},
			{val:'mux', dispName:'Mux'},
			{val:'demux', dispName:'Demux'},
			{val:'crossbar', dispName:'Crossbar'}
		]},
	{name: 'type', dispName: 'Type Symbol', type: 'enum', defVal:'none',
		enumList:[
			{val:'none', dispName:'None'},
			{val:'shiftReg', dispName:'Shift Register'},
			{val:'fifo', dispName:'Fifo / Queue'},
			{val:'ram', dispName:'RAM'},
			{val:'stack', dispName:'Stack'},
			{val:'ringbuffer', dispName:'Ringbuffer'},
			{val:'tree', dispName:'Tree'},
			{val:'fsm', dispName:'FSM'}
		]},
	{name: 'type_loc', dispName: 'Type Symbol Location', type: 'enum', defVal:'topLeft',
		enumList:[
			{val:'topLeft', dispName:'Top Left'},
			{val:'top', dispName:'Top Center'},
			{val:'topRight', dispName:'Top Right'},
			{val:'center', dispName:'Center'},
			{val:'bottomLeft', dispName:'Bottom Left'},
			{val:'bottom', dispName:'Bottom Center'},
			{val:'bottomRight', dispName:'Bottom Right'}
		]},
	{name: 'type_size', dispName: 'Symbol size', type: 'int', min:1, max:1000, defVal:30},
	{name: 'left', dispName: 'Ports left', type: 'string', defVal:"3"},
	{name: 'right', dispName: 'Ports right', type: 'string', defVal:"2"},
	{name: 'top', dispName: 'Ports top', type: 'string', defVal:"1"},
	{name: 'bottom', dispName: 'Ports bottom', type: 'string', defVal:"1"},
	{name: 'drawPins', dispName: 'Draw Pins', type: 'bool', defVal:false}
];

/**
* Function: paintVertexShape
* Untitled Diagram.drawio
* Paints the vertex shape.
*/

function parsePinString( string ) {
	var res = [];
	if (String(string).indexOf(",") != -1 || isNaN(parseInt(string))) {
		string.split(",").forEach(function(kv){
			var tmp = kv.split(":");
			var pin = { name:tmp[0], type:tmp[1] };
			res.push(pin);
		});
	} else {
		for (var i = 0; i < parseInt(string); i++) {
			res.push({name:"", type:undefined});
		}
	}
	return res;
}

function createPins(s, w, h) {
	var res = [];
	left = parsePinString(mxUtils.getValue(s, 'left', '3'))
	top = parsePinString(mxUtils.getValue(s, 'top', '1'))
	right = parsePinString(mxUtils.getValue(s, 'right', '2'))
	bottom = parsePinString(mxUtils.getValue(s, 'bottom', '1'))
	
	left_spacing = h / (left.length + 1);
	top_spacing = w / (top.length + 1);
	right_spacing = h / (right.length + 1);
	bottom_spacing = w / (bottom.length + 1);
	for(var i=0; i < left.length; i++) {
		var p = new mxPoint(0,(i+1)*left_spacing);
	}
	for(var i=0; i < top.length; i++) {
		res.push(new mxPoint((i+1)*top_spacing,0));
	}
	for(var i=0; i < right.length; i++) {
		res.push(new mxPoint(w,(i+1)*right_spacing));
	}
	for(var i=0; i < bottom.length; i++) {
		res.push(new mxPoint((i+1)*bottom_spacing,h));
	}
	return res;
}

mxShapeRTLEntity.prototype.paintVertexShape = function(c, x, y, w, h)
{
	window.c = c;
	window.t = this;
	c.translate(x, y);
	var leftPins = parsePinString(mxUtils.getValue(this.style, 'left', '3'));
	var rightPins = parsePinString(mxUtils.getValue(this.style, 'right', '2'));
	var topPins = parsePinString(mxUtils.getValue(this.style, 'top', '1'));
	var bottomPins = parsePinString(mxUtils.getValue(this.style, 'bottom', '1'));
	var type = mxUtils.getValue(this.style, 'type', 'none');
	var kind = mxUtils.getValue(this.style, 'kind', 'sequential');
	var type_loc = mxUtils.getValue(this.style, 'type_loc', 'topLeft');
	var type_size = mxUtils.getValue(this.style, 'type_size', '30');
	var drawPins = mxUtils.getValue(this.style, 'drawPins', false);
	var padding = drawPins * 10;
	var fontSize = parseFloat(mxUtils.getValue(this.style, 'fontSize', '12'));
	//c.setFontSize(fontSize * 0.5);
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
	
	calcTopY    = function(x) { return padding; }
	calcBottomY = function(x) { return h-padding; }
	calcLeftX   = function(y) { return padding; }
	calcRightX  = function(y) { return w-padding; }
	
	switch(kind) {
		case 'mux':
			calcTopY    = function(x) { return   (x-padding)*(0.2*h-padding)/(w-2*padding)+padding }
			calcBottomY = function(x) { return h-calcTopY(x) }
			break;
		case 'combinational':
			calcTopY    = function(x) { return h/2-((h-2*padding)/2)/((w-2*padding)/2)*Math.sqrt(Math.pow((w-2*padding)/2,2)-Math.pow(x-w/2,2)); }
			calcBottomY = function(x) { return h-calcTopY(x); }
			calcLeftX   = function(y) { return w/2-((w-2*padding)/2)/((h-2*padding)/2)*Math.sqrt(Math.pow((h-2*padding)/2,2)-Math.pow(y-h/2,2)); }
			calcRightX  = function(y) { return w-calcLeftX(y); }
			break;
		case 'demux':
			calcTopY    = function(x) { return   (x-padding)*(-(0.2*h-padding)/(w-2*padding))+0.2*h }
			calcBottomY = function(x) { return h-calcTopY(x) }
			break;
		case 'crossbar':
			calcTopY    = function(x) { if (x < w/2) {
					return   (x-padding)*(0.4*h-padding)/(w-2*padding)+padding
				} else {
					return   (x-padding)*(-(0.4*h-padding)/(w-2*padding))+0.4*h
				}
			}
			calcBottomY = function(x) { return h-calcTopY(x) }
			break;
		case 'sequential':
		default:
			break;
	}
	
	switch(kind) {
		case 'mux':
			c.begin();
			c.moveTo(padding,calcTopY(padding));
			c.lineTo(w-padding,calcTopY(w-padding));
			c.lineTo(w-padding,calcBottomY(w-padding));
			c.lineTo(padding,calcBottomY(padding));
			c.close();
			c.fillAndStroke();
			break;
		case 'combinational':
			c.ellipse(padding,padding,w-2*padding,h-2*padding);
			c.fillAndStroke();
			break;
		case 'demux':
			c.begin();
			c.moveTo(padding,calcTopY(padding));
			c.lineTo(w-padding,calcTopY(w-padding));
			c.lineTo(w-padding,calcBottomY(w-padding));
			c.lineTo(padding,calcBottomY(padding));
			c.close();
			c.fillAndStroke();
			break;
		case 'crossbar':
			c.begin();
			c.moveTo(padding,calcTopY(padding));
			c.lineTo(w/2,calcTopY(w/2));
			c.lineTo(w-padding,calcTopY(w-padding));
			c.lineTo(w-padding,calcBottomY(w-padding));
			c.lineTo(w/2,calcBottomY(w/2));
			c.lineTo(padding,calcBottomY(padding));
			c.close();
			c.fillAndStroke();
			c.begin();
			c.moveTo(w/2,calcTopY(w/2));
			c.lineTo(w/2,calcBottomY(w/2));
			c.end();
			c.stroke()
			break;
		case 'sequential':
		default:
			c.begin();
			c.rect(padding,padding,w-2*padding,h-2*padding);
			c.fillAndStroke();
			break;
	}

	spacing = h / (leftPins.length + 1);
	pinY = spacing;
	leftPins.forEach(function(p) {
		drawPin(p,0,pinY,0,calcLeftX(pinY),type_size,drawPins);
		pinY += spacing;
	});
	
	spacing = h / (rightPins.length + 1);
	pinY = spacing;
	rightPins.forEach(function(p) {
		drawPin(p,w,pinY,180,w-calcRightX(pinY),type_size,drawPins);
		pinY += spacing;
	});
	
	spacing = w / (topPins.length + 1);
	pinX = spacing;
	topPins.forEach(function(p) {
		drawPin(p,pinX,0,90,calcTopY(pinX),type_size,drawPins);
		pinX += spacing;
	});

	spacing = w / (bottomPins.length + 1);
	pinX = spacing;
	bottomPins.forEach(function(p) {
		drawPin(p,pinX,h,270,h-calcBottomY(pinX),type_size,drawPins);
		pinX += spacing;
	});
	
	var offsetX = 0;
	var offsetY = 0;
	switch(type_loc) {
		case 'top':
			offsetX = w/2;
			offsetY = 5 + type_size/2 + padding;
			break;
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
		case 'bottom':
			offsetX = w/2;
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
		case 'tree':       symbolRTLTree(c,offsetX,offsetY,type_size);       break;
		case 'fsm':        symbolRTLFSM(c,offsetX,offsetY,type_size);        break;
		case 'none':
		default:
			break;
	};
};
	
function drawPin(p,x,y,rot,padding,size,drawPins) {
	c.translate(x,y);
	c.rotate(rot,0,0,0,0);
	var txtOffset = 0;
	switch(p.type) {
		case "no":
		case "np":
		case "nopin":
			break;
		case "nc":
			c.begin();
			if (drawPins) {
				c.moveTo(0,0);
				c.lineTo(padding,0);
				c.moveTo(0-size/4,0-size/4);
				c.lineTo(0+size/4,0+size/4);
				c.moveTo(0-size/4,0+size/4);
				c.lineTo(0+size/4,0-size/4);
				c.stroke();
			}
			c.end();
			break;
		case "n":
		case "neg":
		case "not":
			c.begin();
			if (drawPins) {
				c.moveTo(0,0);
				c.lineTo(padding,0);
				c.stroke();
				c.ellipse(padding-size/4,-size/8,size/4,size/4);
				c.fillAndStroke();
			}
			c.end();
			break;
		case "clk":
		case "clock":
			c.begin();
			c.moveTo(padding,0 - size/4);
			c.lineTo(padding + size/4,0);
			c.lineTo(padding,0 + size/4);
			if (drawPins) {
				c.moveTo(0,0);
				c.lineTo(padding,0);
			}
			c.stroke();
			c.end();
			txtOffset = size/4;
			break;
		case "nclk":
		case "nclock":
			c.begin();
			c.moveTo(padding,0 - size/4);
			c.lineTo(padding + size/4,0);
			c.lineTo(padding,0 + size/4);
			if (drawPins) {
				c.moveTo(0,0);
				c.lineTo(padding,0);
				c.stroke();
				c.ellipse(padding/2,0-padding/4,padding/2,padding/2);
			}
			c.fillAndStroke();
			c.end();
			txtOffset = size/4;
			break;
		default:
			c.begin();
			if (drawPins) {
				c.moveTo(0,0);
				c.lineTo(padding,0);
				c.stroke();
			}
			c.end();
	}
	switch(rot) {
		case 0:
			c.text(5+padding + txtOffset, 0, 0, 0, p.name, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			break;
		case 180:
			c.text(5+padding + txtOffset, 0, 0, 0, p.name, mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 180);
			break;
		case 90:
			c.text(5+padding + txtOffset, 0, 0, 0, p.name, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			break;
		case 270:
			c.text(5+padding + txtOffset, 0, 0, 0, p.name, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			break;
	}
	c.rotate(-rot,0,0,0,0);	
	c.translate(-x,-y);
	c.end();
}

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

function symbolRTLTree(c,x,y,size) {
	var r = size/8;
	var d = size/5;
	y -= 1.5*d;
	x += r/2;
	y += r/2;
	c.begin()
	c.moveTo(x,y);
	c.lineTo(x+d,y+d);
	c.moveTo(x,y);
	c.lineTo(x-d,y+d);
	c.moveTo(x-d,y+d);
	c.lineTo(x-2*d,y+2*d);
	c.moveTo(x-d,y+d);
	c.lineTo(x,y+2*d);
	c.moveTo(x,y+2*d);
	c.lineTo(x-d,y+3*d);
	c.moveTo(x,y+2*d);
	c.lineTo(x+d,y+3*d);
	c.stroke()
	x -= r/2;
	y -= r/2;
	c.ellipse(x,y,r,r);
	c.fillAndStroke();
	c.ellipse(x+d,y+d,r,r);
	c.fillAndStroke();
	c.ellipse(x-d,y+d,r,r);
	c.fillAndStroke();
	c.ellipse(x-2*d,y+2*d,r,r);
	c.fillAndStroke();
	c.ellipse(x,y+2*d,r,r);
	c.fillAndStroke();
	c.ellipse(x-d,y+3*d,r,r);
	c.fillAndStroke();
	c.ellipse(x+d,y+3*d,r,r);
	c.fillAndStroke();
	c.end();
}

function symbolRTLFSM(c,x,y,size) {
	var r = size/6;
	var d = size/2.5;
	y -= d/2;
	x += r/2;
	y += r/2;
	c.begin()
	c.moveTo(x-d,y);
	c.lineTo(x+d,y);
	c.end();
	c.stroke();
	c.begin();
	c.moveTo(x+d-r/2,y);
	c.lineTo(x+d-r,y-r/2);
	c.lineTo(x+d-r,y+r/2);
	c.close()
	c.end();
	c.fillAndStroke();
	c.begin();
	c.moveTo(x+d,y);
	c.lineTo(x,y+d);
	c.end();
	c.stroke();
	c.begin();
	c.moveTo(x+r/2/1.4,y+d-r/2/1.4);
	c.lineTo(x+r/2/1.4,y+d-r/2/1.4-r/2*1.4);
	c.lineTo(x+r/2/1.4+r/2*1.4,y+d-r/2/1.4);
	c.close()
	c.fillAndStroke();
	c.begin()
	c.moveTo(x,y+d);
	c.lineTo(x-d,y);
	c.end();
	c.stroke()
	c.begin();
	c.moveTo(x-d+r/2/1.4,y+r/2/1.4);
	c.lineTo(x-d+r/2/1.4,y+r/2/1.4+r/2*1.4);
	c.lineTo(x-d+r/2/1.4+r/2*1.4,y+r/2/1.4);
	c.close()
	c.fillAndStroke();
	x -= r/2;
	y -= r/2;
	c.ellipse(x+d,y,r,r);
	c.fillAndStroke();
	c.ellipse(x-d,y,r,r);
	c.fillAndStroke();
	c.ellipse(x,y+d,r,r);
	c.fillAndStroke();
	c.end();
}

mxCellRenderer.registerShape(mxShapeRTLEntity.prototype.cst.SHAPE_ENTITY, mxShapeRTLEntity);

mxShapeRTLEntity.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var leftPins = parsePinString(mxUtils.getValue(this.style, 'left', '3'));
	var rightPins = parsePinString(mxUtils.getValue(this.style, 'right', '2'));
	var topPins = parsePinString(mxUtils.getValue(this.style, 'top', '1'));
	var bottomPins = parsePinString(mxUtils.getValue(this.style, 'bottom', '1'));
	var dir = mxUtils.getValue(this.style, 'direction', 'east');

	var padding = 0;

	spacing = h / (leftPins.length + 1)
	pinY = spacing;
	leftPins.forEach(function(p) {
		constr.push(new mxConnectionConstraint(new mxPoint(0, pinY/h), false, 0, 0));
		pinY += spacing;
	});
	spacing = h / (rightPins.length + 1)
	pinY = spacing;
	rightPins.forEach(function(p) {
		constr.push(new mxConnectionConstraint(new mxPoint(1, pinY/h), false, 0, 0));
		pinY += spacing;
	});
	spacing = w / (topPins.length + 1)
	pinX = spacing;
	topPins.forEach(function(p) {
		constr.push(new mxConnectionConstraint(new mxPoint(pinX/w, 0), false, 0, 0));
		pinX += spacing;
	});
	spacing = w / (bottomPins.length + 1)
	pinX = spacing;
	bottomPins.forEach(function(p) {
		constr.push(new mxConnectionConstraint(new mxPoint(pinX/w,1), false, 0, 0));
		pinX += spacing;
	});
	return (constr);
}
