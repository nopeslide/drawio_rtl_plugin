//**********************************************************************************************************************************************************
//Entity
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeRTLEntity(bounds, fill, stroke, strokewidth) {
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
	SHAPE_ENTITY: 'mxgraph.rtl.abstract.entity'
};

mxShapeRTLEntity.prototype.customProperties = [
	{
		name: 'kind', dispName: 'Type', type: 'enum', defVal: 'sequential',
		enumList: [
			{ val: 'sequential', dispName: 'Seq. Logic' },
			{ val: 'combinational', dispName: 'Comb. Logic' },
			{ val: 'mux', dispName: 'Mux' },
			{ val: 'demux', dispName: 'Demux' },
			{ val: 'crossbar', dispName: 'Crossbar' }
		]
	},
	{
		name: 'type', dispName: 'Type Symbol', type: 'enum', defVal: 'none',
		enumList: [
			{ val: 'none', dispName: 'None' },
			{ val: 'shiftReg', dispName: 'Shift Register' },
			{ val: 'fifo', dispName: 'Fifo / Queue' },
			{ val: 'ram', dispName: 'RAM' },
			{ val: 'stack', dispName: 'Stack' },
			{ val: 'ringbuffer', dispName: 'Ringbuffer' },
			{ val: 'tree', dispName: 'Tree' },
			{ val: 'fsm', dispName: 'FSM' }
		]
	},
	{
		name: 'type_loc', dispName: 'Type Symbol Location', type: 'enum', defVal: 'topLeft',
		enumList: [
			{ val: 'topLeft', dispName: 'Top Left' },
			{ val: 'top', dispName: 'Top Center' },
			{ val: 'topRight', dispName: 'Top Right' },
			{ val: 'center', dispName: 'Center' },
			{ val: 'bottomLeft', dispName: 'Bottom Left' },
			{ val: 'bottom', dispName: 'Bottom Center' },
			{ val: 'bottomRight', dispName: 'Bottom Right' }
		]
	},
	{ name: 'type_size', dispName: 'Symbol size', type: 'int', min: 1, max: 1000, defVal: 30 },
	{ name: 'left', dispName: 'Ports left', type: 'string', defVal: "3" },
	{ name: 'right', dispName: 'Ports right', type: 'string', defVal: "2" },
	{ name: 'top', dispName: 'Ports top', type: 'string', defVal: "1" },
	{ name: 'bottom', dispName: 'Ports bottom', type: 'string', defVal: "1" },
	{ name: 'drawPins', dispName: 'Draw Pins', type: 'bool', defVal: false }
];

/**
* Function: paintVertexShape
* Untitled Diagram.drawio
* Paints the vertex shape.
*/

function parsePinString(string) {
	var res = [];
	if (String(string).indexOf(",") != -1 || isNaN(parseInt(string))) {
		string.split(",").forEach(function (kv) {
			var tmp = kv.split(":");
			var pin = { name: tmp[0]};
			pin.draw  = true;
			pin.clock = false;
			pin.neg   = false;
			pin.in    = false;
			pin.out   = false;
			pin.inout = false;
			pin.notConnected = false;
			for( var i = 1; i < tmp.length; i++) {
				switch(tmp[i]) {
					case "no":
					case "np":
					case "nopin":
						pin.draw = false;
						break;
					case "nc":
						pin.notConnected = true;
						break;
					case "n":
					case "neg":
					case "not":
						pin.neg = true;
						break;
					case "c":
					case "clk":
					case "clock":
						pin.clock = true;
						break;
					case "nclk":
					case "nclock":
						pin.clock = true;
						pin.neg = true;
						break;
					case "i":
					case "in":
						pin.in  = true;
						pin.out = false;
						break;
					case "o":
					case "out":
						pin.in  = false;
						pin.out = true;
						break;
					case "io":
					case "inout":
						pin.in  = false;
						pin.out = false;
						pin.inout = true;
						break;
				}
			}
			res.push(pin);
		});
	} else {
		for (var i = 0; i < parseInt(string); i++) {
			res.push({ name: "", draw:true });
		}
	}
	return res;
}

mxShapeRTLEntity.prototype.calcTopY = function (x) { return padding; }
mxShapeRTLEntity.prototype.calcBottomY = function (x) { return h - padding; }
mxShapeRTLEntity.prototype.calcLeftX = function (y) { return padding; }
mxShapeRTLEntity.prototype.calcRightX = function (y) { return w - padding; }

mxShapeRTLEntity.prototype.paintVertexShape = function (c, x, y, w, h) {
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

	switch (dir) {
		case 'south':
			txtRot = 270;
			break;
		case 'west':
			txtRot = 180;
			break;
		case 'north':
			txtRot = 90;
			break;
	}

	this.calcTopY = function (x) { return padding; }
	this.calcBottomY = function (x) { return h - padding; }
	this.calcLeftX = function (y) { return padding; }
	this.calcRightX = function (y) { return w - padding; }

	switch (kind) {
		case 'mux':
			this.calcTopY = function (x) { return (x - padding)*0.75 + padding }
			this.calcBottomY = function (x) { return h - this.calcTopY(x) }
			break;
		case 'combinational':
			this.calcTopY = function (x) { return h / 2 - ((h - 2 * padding) / 2) / ((w - 2 * padding) / 2) * Math.sqrt(Math.pow((w - 2 * padding) / 2, 2) - Math.pow(x - w / 2, 2)); }
			this.calcBottomY = function (x) { return h - this.calcTopY(x); }
			this.calcLeftX = function (y) { return w / 2 - ((w - 2 * padding) / 2) / ((h - 2 * padding) / 2) * Math.sqrt(Math.pow((h - 2 * padding) / 2, 2) - Math.pow(y - h / 2, 2)); }
			this.calcRightX = function (y) { return w - this.calcLeftX(y); }
			break;
		case 'demux':
			this.calcTopY = function (x) { return (x - padding) * (-(0.2 * h - padding) / (w - 2 * padding)) + 0.2 * h }
			this.calcBottomY = function (x) { return h - this.calcTopY(x) }
			break;
		case 'crossbar':
			this.calcTopY = function (x) {
				if (x < w / 2) {
					return (x - padding) * (0.4 * h - padding) / (w - 2 * padding) + padding
				} else {
					return (x - padding) * (-(0.4 * h - padding) / (w - 2 * padding)) + 0.4 * h
				}
			}
			this.calcBottomY = function (x) { return h - this.calcTopY(x) }
			break;
		case 'sequential':
		default:
			break;
	}

	switch (kind) {
		case 'mux':
			c.begin();
			c.moveTo(padding, this.calcTopY(padding));
			c.lineTo(w - padding, this.calcTopY(w - padding));
			c.lineTo(w - padding, this.calcBottomY(w - padding));
			c.lineTo(padding, this.calcBottomY(padding));
			c.close();
			c.fillAndStroke();
			break;
		case 'combinational':
			c.ellipse(padding, padding, w - 2 * padding, h - 2 * padding);
			c.fillAndStroke();
			break;
		case 'demux':
			c.begin();
			c.moveTo(padding, this.calcTopY(padding));
			c.lineTo(w - padding, this.calcTopY(w - padding));
			c.lineTo(w - padding, this.calcBottomY(w - padding));
			c.lineTo(padding, this.calcBottomY(padding));
			c.close();
			c.fillAndStroke();
			break;
		case 'crossbar':
			c.begin();
			c.moveTo(padding, this.calcTopY(padding));
			c.lineTo(w / 2, this.calcTopY(w / 2));
			c.lineTo(w - padding, this.calcTopY(w - padding));
			c.lineTo(w - padding, this.calcBottomY(w - padding));
			c.lineTo(w / 2, this.calcBottomY(w / 2));
			c.lineTo(padding, this.calcBottomY(padding));
			c.close();
			c.fillAndStroke();
			c.begin();
			c.moveTo(w / 2, this.calcTopY(w / 2));
			c.lineTo(w / 2, this.calcBottomY(w / 2));
			c.end();
			c.stroke()
			break;
		case 'sequential':
		default:
			c.begin();
			c.rect(padding, padding, w - 2 * padding, h - 2 * padding);
			c.fillAndStroke();
			break;
	}

	spacing = h / (leftPins.length + 1);
	pinY = spacing;
	const fontFamily = this.style.fontFamily;
	const fillColor  = this.style.fillColor;
	leftPins.forEach((p) => {
		drawPin(p, 0, pinY, 0, this.calcLeftX(pinY), type_size, drawPins, fontFamily, fillColor);
		pinY += spacing;
	});

	spacing = h / (rightPins.length + 1);
	pinY = spacing;
	rightPins.forEach((p) => {
		drawPin(p, w, pinY, 180, w - this.calcRightX(pinY), type_size, drawPins, fontFamily, fillColor);
		pinY += spacing;
	});

	spacing = w / (topPins.length + 1);
	pinX = spacing;
	topPins.forEach((p) => {
		drawPin(p, pinX, 0, 90, this.calcTopY(pinX), type_size, drawPins, fontFamily, fillColor);
		pinX += spacing;
	});

	spacing = w / (bottomPins.length + 1);
	pinX = spacing;
	bottomPins.forEach((p) => {
		drawPin(p, pinX, h, 270, h - this.calcBottomY(pinX), type_size, drawPins, fontFamily, fillColor);
		pinX += spacing;
	});

	var offsetX = 0;
	var offsetY = 0;
	switch (type_loc) {
		case 'top':
			offsetX = w / 2;
			offsetY = 5 + type_size / 2 + padding;
			break;
		case 'topLeft':
			offsetX = 5 + type_size / 2 + padding;
			offsetY = 5 + type_size / 2 + padding;
			break;
		case 'topRight':
			offsetX = w - 5 - type_size / 2 - padding;
			offsetY = 5 + type_size / 2 + padding;
			break;
		case 'center':
			offsetX = w / 2;
			offsetY = h / 2;
			break;
		case 'bottomLeft':
			offsetX = 5 + type_size / 2 + padding;
			offsetY = h - 5 - type_size / 2 - padding;
			break;
		case 'bottom':
			offsetX = w / 2;
			offsetY = h - 5 - type_size / 2 - padding;
			break;
		case 'bottomRight':
			offsetX = w - 5 - type_size / 2 - padding;
			offsetY = h - 5 - type_size / 2 - padding;
			break;
		default:
			break;
	};

	switch (type) {
		case 'shiftReg': symbolRTLShiftReg(c, offsetX, offsetY, type_size); break;
		case 'fifo': symbolRTLFifo(c, offsetX, offsetY, type_size); break;
		case 'ram': symbolRTLRAM(c, offsetX, offsetY, type_size); break;
		case 'stack': symbolRTLStack(c, offsetX, offsetY, type_size); break;
		case 'ringbuffer': symbolRTLRingBuffer(c, offsetX, offsetY, type_size); break;
		case 'tree': symbolRTLTree(c, offsetX, offsetY, type_size); break;
		case 'fsm': symbolRTLFSM(c, offsetX, offsetY, type_size); break;
		case 'none':
		default:
			break;
	};
};

function drawPin(pin, x, y, rot, padding, size, drawPins, fontFamily, fillColor) {
	c.translate(x, y);
	c.rotate(rot, 0, 0, 0, 0);
	var txtOffset = 0;
	if (pin.draw && drawPins) {
		c.begin();
		c.moveTo(0, 0);
		c.lineTo(padding, 0);
		c.stroke();
	}
	if (pin.clock) {
		c.begin();
		c.moveTo(padding, 0 - size / 4);
		c.lineTo(padding + size / 4, 0);
		c.lineTo(padding, 0 + size / 4);
		c.stroke();
		txtOffset += size/4;
	}
	if (pin.neg && pin.draw && drawPins) {
		c.ellipse(padding - size / 6, -size / 12, size / 6, size / 6);
		c.fillAndStroke();
	}
	if (pin.in && pin.draw && drawPins) {
		c.begin();
		c.moveTo(padding-8,0);
		c.lineTo(padding-3,2);
		c.lineTo(padding-3,-2);
		c.close()
		c.setFillColor(0);
		c.fillAndStroke();
		c.setFillColor(fillColor);
	}
	if (pin.out && pin.draw && drawPins) {
		c.begin();
		c.moveTo(padding-8, 2);
		c.lineTo(padding-3,0);
		c.lineTo(padding-8,-2);
		c.close()
		c.setFillColor(0);
		c.fillAndStroke();
		c.setFillColor(fillColor);
	}
	if (pin.inout && pin.draw && drawPins) {
		c.begin();
		c.moveTo(padding-9, 0);
		c.lineTo(padding-6,2);
		c.lineTo(padding-6,-2);
		c.close()
		c.setFillColor(0);
		c.fillAndStroke();
		c.begin();
		c.moveTo(padding-4, 2);
		c.lineTo(padding-1, 0);
		c.lineTo(padding-4,-2);
		c.close()
		c.setFillColor(0);
		c.fillAndStroke();
		c.setFillColor(fillColor);
	}
	if (pin.notConnected && pin.draw) {
		c.begin();
		c.moveTo(0 - size / 8, 0 - size / 8);
		c.lineTo(0 + size / 8, 0 + size / 8);
		c.moveTo(0 - size / 8, 0 + size / 8);
		c.lineTo(0 + size / 8, 0 - size / 8);
		c.stroke();
	}
	c.setFontFamily(fontFamily);
	switch (rot) {
		case 0:
			c.text(5 + padding + txtOffset, 0, 0, 0, pin.name, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			break;
		case 180:
			c.text(5 + padding + txtOffset, 0, 0, 0, pin.name, mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 180);
			break;
		case 90:
			c.text(5 + padding + txtOffset, 0, 0, 0, pin.name, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			break;
		case 270:
			c.text(5 + padding + txtOffset, 0, 0, 0, pin.name, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			break;
	}
	c.rotate(-rot, 0, 0, 0, 0);
	c.translate(-x, -y);
	c.end();
}

function symbolRTLShiftReg(c, x, y, size) {
	var height = 3 * size / 5;
	var width = height / 2;
	x -= width / 2;
	y -= height / 2;
	c.begin()
	c.rect(x + width / 2, y - height / 4, width, height);
	c.fillAndStroke();
	c.rect(x, y, width, height);
	c.fillAndStroke();
	c.rect(x - width / 2, y + height / 4, width, height);
	c.fillAndStroke();
	c.end();
}

function symbolRTLFifo(c, x, y, size) {
	var height = 3 * size / 4;
	var width = height / 5;
	c.begin()
	c.moveTo(x - size / 2, y - size / 4);
	c.lineTo(x - size / 2, y - size / 2);
	c.lineTo(x + size / 2, y - size / 2);
	c.lineTo(x + size / 2, y - size / 4);

	c.moveTo(x - size / 2, y + size / 4);
	c.lineTo(x - size / 2, y + size / 2);
	c.lineTo(x + size / 2, y + size / 2);
	c.lineTo(x + size / 2, y + size / 4);
	c.stroke();

	c.rect(x + size / 2 - width / 4 - 3 * width / 2, y - height / 2, width, height);
	c.stroke();
	c.rect(x + size / 2 - width / 4 - 6 * width / 2, y - height / 2, width, height);
	c.stroke();
	c.rect(x + size / 2 - width / 4 - 9 * width / 2, y - height / 2, width, height);
	c.stroke();
	c.end()
}

function symbolRTLStack(c, x, y, size) {
	var width = 3 * size / 4;
	var height = width / 5;
	c.begin()
	c.moveTo(x - size / 4, y - size / 2);
	c.lineTo(x - size / 2, y - size / 2);
	c.lineTo(x - size / 2, y + size / 2);
	c.lineTo(x + size / 2, y + size / 2);
	c.lineTo(x + size / 2, y - size / 2);
	c.lineTo(x + size / 4, y - size / 2);
	c.stroke();

	c.rect(x - width / 2, y + size / 2 - height / 4 - 3 * height / 2, width, height);
	c.stroke();
	c.rect(x - width / 2, y + size / 2 - height / 4 - 6 * height / 2, width, height);
	c.stroke();
	c.rect(x - width / 2, y + size / 2 - height / 4 - 9 * height / 2, width, height);
	c.stroke();
	c.end()
}

function symbolRTLRAM(c, x, y, size) {
	var width = size;
	var height = width / 5;
	c.begin()
	c.rect(x - width / 2, y - size / 2, width, height);
	c.stroke();
	c.rect(x - width / 2, y - size / 2 + height, width, height);
	c.stroke();
	c.rect(x - width / 2, y - size / 2 + 2 * height, width, height);
	c.stroke();
	c.rect(x - width / 2, y - size / 2 + 3 * height, width, height);
	c.stroke();
	c.rect(x - width / 2, y - size / 2 + 4 * height, width, height);
	c.stroke();
	c.end()
	c.begin();
	c.moveTo(x - size / 4, y - size / 2);
	c.lineTo(x - size / 4, y + size / 2);
	c.stroke();
	c.end()
}

function symbolRTLRingBuffer(c, x, y, size) {
	var height = 3 * size / 5;
	var width = height / 2;
	x -= width / 2;
	y -= size / 2;
	c.begin()
	c.rect(x, y, width, height);
	c.fillAndStroke();
	c.rect(x - 7 * width / 8, y + 1 * size / 16, width, height);
	c.fillAndStroke();
	c.rect(x + 7 * width / 8, y + 1 * size / 16, width, height);
	c.fillAndStroke();
	c.rect(x - 11 * width / 8, y + 2 * size / 16, width, height);
	c.fillAndStroke();
	c.rect(x + 11 * width / 8, y + 2 * size / 16, width, height);
	c.fillAndStroke();
	c.rect(x - 7 * width / 8, y + 4 * size / 16, width, height);
	c.fillAndStroke();
	c.rect(x + 7 * width / 8, y + 4 * size / 16, width, height);
	c.fillAndStroke();
	c.rect(x, y + 5 * size / 16, width, height);
	c.fillAndStroke();
	c.end();
}

function symbolRTLTree(c, x, y, size) {
	var r = size / 8;
	var d = size / 5;
	y -= 1.5 * d;
	x += r / 2;
	y += r / 2;
	c.begin()
	c.moveTo(x, y);
	c.lineTo(x + d, y + d);
	c.moveTo(x, y);
	c.lineTo(x - d, y + d);
	c.moveTo(x - d, y + d);
	c.lineTo(x - 2 * d, y + 2 * d);
	c.moveTo(x - d, y + d);
	c.lineTo(x, y + 2 * d);
	c.moveTo(x, y + 2 * d);
	c.lineTo(x - d, y + 3 * d);
	c.moveTo(x, y + 2 * d);
	c.lineTo(x + d, y + 3 * d);
	c.stroke()
	x -= r / 2;
	y -= r / 2;
	c.ellipse(x, y, r, r);
	c.fillAndStroke();
	c.ellipse(x + d, y + d, r, r);
	c.fillAndStroke();
	c.ellipse(x - d, y + d, r, r);
	c.fillAndStroke();
	c.ellipse(x - 2 * d, y + 2 * d, r, r);
	c.fillAndStroke();
	c.ellipse(x, y + 2 * d, r, r);
	c.fillAndStroke();
	c.ellipse(x - d, y + 3 * d, r, r);
	c.fillAndStroke();
	c.ellipse(x + d, y + 3 * d, r, r);
	c.fillAndStroke();
	c.end();
}

function symbolRTLFSM(c, x, y, size) {
	var r = size / 6;
	var d = size / 2.5;
	y -= d / 2;
	x += r / 2;
	y += r / 2;
	c.begin()
	c.moveTo(x - d, y);
	c.lineTo(x + d, y);
	c.end();
	c.stroke();
	c.begin();
	c.moveTo(x + d - r / 2, y);
	c.lineTo(x + d - r, y - r / 2);
	c.lineTo(x + d - r, y + r / 2);
	c.close()
	c.end();
	c.fillAndStroke();
	c.begin();
	c.moveTo(x + d, y);
	c.lineTo(x, y + d);
	c.end();
	c.stroke();
	c.begin();
	c.moveTo(x + r / 2 / 1.4, y + d - r / 2 / 1.4);
	c.lineTo(x + r / 2 / 1.4, y + d - r / 2 / 1.4 - r / 2 * 1.4);
	c.lineTo(x + r / 2 / 1.4 + r / 2 * 1.4, y + d - r / 2 / 1.4);
	c.close()
	c.fillAndStroke();
	c.begin()
	c.moveTo(x, y + d);
	c.lineTo(x - d, y);
	c.end();
	c.stroke()
	c.begin();
	c.moveTo(x - d + r / 2 / 1.4, y + r / 2 / 1.4);
	c.lineTo(x - d + r / 2 / 1.4, y + r / 2 / 1.4 + r / 2 * 1.4);
	c.lineTo(x - d + r / 2 / 1.4 + r / 2 * 1.4, y + r / 2 / 1.4);
	c.close()
	c.fillAndStroke();
	x -= r / 2;
	y -= r / 2;
	c.ellipse(x + d, y, r, r);
	c.fillAndStroke();
	c.ellipse(x - d, y, r, r);
	c.fillAndStroke();
	c.ellipse(x, y + d, r, r);
	c.fillAndStroke();
	c.end();
}

mxCellRenderer.registerShape(mxShapeRTLEntity.prototype.cst.SHAPE_ENTITY, mxShapeRTLEntity);

mxShapeRTLEntity.prototype.getConstraints = function (style, w, h) {
	var constr = [];
	var leftPins = parsePinString(mxUtils.getValue(this.style, 'left', '3'));
	var rightPins = parsePinString(mxUtils.getValue(this.style, 'right', '2'));
	var topPins = parsePinString(mxUtils.getValue(this.style, 'top', '1'));
	var bottomPins = parsePinString(mxUtils.getValue(this.style, 'bottom', '1'));
	var dir = mxUtils.getValue(this.style, 'direction', 'east');

	var padding = 0;

	spacing = h / (leftPins.length + 1)
	pinY = spacing;
	leftPins.forEach((p) => {
		constr.push(new mxConnectionConstraint(new mxPoint(0, pinY / h), false, "", 0, 0));
		constr.push(new mxConnectionConstraint(new mxPoint(this.calcLeftX(pinY)/w, pinY / h), false, "", 0, 0));
		pinY += spacing;
	});
	spacing = h / (rightPins.length + 1)
	pinY = spacing;
	rightPins.forEach((p) => {
		constr.push(new mxConnectionConstraint(new mxPoint(1, pinY / h), false, "", 0, 0));
		constr.push(new mxConnectionConstraint(new mxPoint(this.calcRightX(pinY)/w, pinY / h), false, "", 0, 0));
		pinY += spacing;
	});
	spacing = w / (topPins.length + 1)
	pinX = spacing;
	topPins.forEach((p) => {
		constr.push(new mxConnectionConstraint(new mxPoint(pinX / w, 0), false, "", 0, 0));
		constr.push(new mxConnectionConstraint(new mxPoint(pinX / w, this.calcTopY(pinX)/h), false, "", 0, 0));
		pinX += spacing;
	});
	spacing = w / (bottomPins.length + 1)
	pinX = spacing;
	bottomPins.forEach((p) => {
		constr.push(new mxConnectionConstraint(new mxPoint(pinX / w, 1), false, "", 0, 0));
		constr.push(new mxConnectionConstraint(new mxPoint(pinX / w, (this.calcBottomY(pinX))/h), false, "", 0, 0));
		pinX += spacing;
	});
	return (constr);
}
