import calculateSize from "calculate-size";
import {Bezier} from "bezier-js";

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
			{ val: 'crossbar', dispName: 'Crossbar' },
			{ val: 'port', dispName: 'Port' },
			{ val: 'and', dispName: 'AND' },
			{ val: 'or', dispName: 'OR' },
			{ val: 'xor', dispName: 'XOR' }
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
	{ name: 'pinSnap', dispName: 'Pin snap size', type: 'int', min: 1, max: 1000, defVal: 10 },
	{ name: 'leftRot', dispName: 'Ports left label Rotation', type: 'int', min: 0, max: 360, defVal: 0 },
	{
		name: 'leftAnchor', dispName: 'Ports left label Anchor', type: 'enum', defVal: mxConstants.ALIGN_LEFT,
		enumList: [
			{ val: mxConstants.ALIGN_LEFT, dispName: 'Left' },
			{ val: mxConstants.ALIGN_MIDDLE, dispName: 'Middle' },
			{ val: mxConstants.ALIGN_RIGHT, dispName: 'Right' }
		]
	},
	{ name: 'left', dispName: 'Ports left', type: 'auto', defVal: 3, dependentProps: ['leftArr'] },
	{ name: 'leftArr', dispName: 'Ports left Array', type: 'staticArr', subType: 'string', sizeProperty: 'left', subDefVal: '', defVal: ',,' },
	{ name: 'rightRot', dispName: 'Ports right label Rotation', type: 'int', min: 0, max: 360, defVal: 180 },
	{
		name: 'rightAnchor', dispName: 'Ports right label Anchor', type: 'enum', defVal: mxConstants.ALIGN_RIGHT,
		enumList: [
			{ val: mxConstants.ALIGN_LEFT, dispName: 'Left' },
			{ val: mxConstants.ALIGN_MIDDLE, dispName: 'Middle' },
			{ val: mxConstants.ALIGN_RIGHT, dispName: 'Right' }
		]
	},
	{ name: 'right', dispName: 'Ports right', type: 'auto', defVal: 2 },
	{ name: 'rightArr', dispName: 'Ports right Array', type: 'staticArr', subType: 'string', sizeProperty: 'right', subDefVal: '', defVal: ',' },
	{ name: 'topRot', dispName: 'Ports top label Rotation', type: 'int', min: 0, max: 360, defVal: 0 },
	{
		name: 'topAnchor', dispName: 'Ports top label Anchor', type: 'enum', defVal: mxConstants.ALIGN_LEFT,
		enumList: [
			{ val: mxConstants.ALIGN_LEFT, dispName: 'Left' },
			{ val: mxConstants.ALIGN_MIDDLE, dispName: 'Middle' },
			{ val: mxConstants.ALIGN_RIGHT, dispName: 'Right' }
		]
	},
	{ name: 'top', dispName: 'Ports top', type: 'auto', defVal: 1 },
	{ name: 'topArr', dispName: 'Ports top Array', type: 'staticArr', subType: 'string', sizeProperty: 'top', subDefVal: '', defVal: '' },
	{ name: 'bottomRot', dispName: 'Ports bottom label Rotation', type: 'int', min: 0, max: 360, defVal: 0 },
	{
		name: 'bottomAnchor', dispName: 'Ports bottom label Anchor', type: 'enum', defVal: mxConstants.ALIGN_LEFT,
		enumList: [
			{ val: mxConstants.ALIGN_LEFT, dispName: 'Left' },
			{ val: mxConstants.ALIGN_MIDDLE, dispName: 'Middle' },
			{ val: mxConstants.ALIGN_RIGHT, dispName: 'Right' }
		]
	},
	{ name: 'bottom', dispName: 'Ports bottom', type: 'auto', defVal: 1 },
	{ name: 'bottomArr', dispName: 'Ports bottom Array', type: 'staticArr', subType: 'string', sizeProperty: 'bottom', subDefVal: '', defVal: '' },
	{ name: 'drawPins', dispName: 'Draw Pins', type: 'bool', defVal: false },
	{ name: 'externalPins', dispName: 'External Pins', type: 'bool', defVal: false },
	{ name: 'pinFontSize', dispName: 'Pin Fontsize', type: 'int', min: 1, max: 1000, defVal: 12 }
];

/**
* Function: paintVertexShape
* Untitled Diagram.drawio
* Paints the vertex shape.
*/

function parsePinStyle(string) {
	var tmp = string.split(":");
	var pin = { name: tmp[0] };
	pin.draw = true;
	pin.clock = false;
	pin.neg = false;
	pin.in = false;
	pin.out = false;
	pin.inout = false;
	pin.notConnected = false;
	for (var i = 1; i < tmp.length; i++) {
		switch (tmp[i]) {
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
				pin.in = true;
				pin.out = false;
				break;
			case "o":
			case "out":
				pin.in = false;
				pin.out = true;
				break;
			case "io":
			case "inout":
				pin.in = false;
				pin.out = false;
				pin.inout = true;
				break;
		}
	}
	return pin;
}


function parsePins(pinString, pinArray) {
	var res = [];
	pinString = decodeURIComponent(pinString);
	if (String(pinString).indexOf(",") != -1 || isNaN(parseInt(pinString))) {
		pinString.split(",").forEach(function (pinStyle) {
			res.push(parsePinStyle(pinStyle));
		});
	} else {
		for (var i = 0; i < parseInt(pinString); i++) {
			if (i < pinArray.length) {
				res.push(parsePinStyle(decodeURIComponent(pinArray[i])));
			} else {
				res.push(parsePinStyle(""));
			}
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
	var leftPins = parsePins(mxUtils.getValue(this.style, 'left', 3), mxUtils.getValue(this.style, 'leftArr', ',,').split(','));
	var rightPins = parsePins(mxUtils.getValue(this.style, 'right', 2), mxUtils.getValue(this.style, 'rightArr', ',').split(','));
	var topPins = parsePins(mxUtils.getValue(this.style, 'top', 1), mxUtils.getValue(this.style, 'topArr', '').split(','));
	var bottomPins = parsePins(mxUtils.getValue(this.style, 'bottom', 1), mxUtils.getValue(this.style, 'bottomArr', '').split(','));
	var leftRot = parseInt(mxUtils.getValue(this.style, 'leftRot', 0));
	var rightRot = parseInt(mxUtils.getValue(this.style, 'rightRot', 180));
	var topRot = parseInt(mxUtils.getValue(this.style, 'topRot', 0));
	var bottomRot = parseInt(mxUtils.getValue(this.style, 'bottomRot', 0));
	var leftAnchor = mxUtils.getValue(this.style, 'leftAnchor', mxConstants.ALIGN_LEFT);
	var rightAnchor = mxUtils.getValue(this.style, 'rightAnchor', mxConstants.ALIGN_RIGHT);
	var topAnchor = mxUtils.getValue(this.style, 'topAnchor', mxConstants.ALIGN_LEFT);
	var bottomAnchor = mxUtils.getValue(this.style, 'bottomAnchor', mxConstants.ALIGN_LEFT);
	var pinSnap = mxUtils.getValue(this.style, 'pinSnap', 10);
	var type = mxUtils.getValue(this.style, 'type', 'none');
	var kind = mxUtils.getValue(this.style, 'kind', 'sequential');
	var type_loc = mxUtils.getValue(this.style, 'type_loc', 'topLeft');
	var type_size = mxUtils.getValue(this.style, 'type_size', '30');
	var drawPins = mxUtils.getValue(this.style, 'drawPins', false);
	var externalPins = mxUtils.getValue(this.style, 'externalPins', false);
	var padding = (drawPins && !externalPins) * 10;
	var fontSize = parseFloat(mxUtils.getValue(this.style, 'fontSize', '12'));
	var pinFontSize = parseFloat(mxUtils.getValue(this.style, 'pinFontSize', '12'));
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
			this.calcTopY = function (x) { return Math.min(Math.round((x - padding) * (1/2) + padding), h/2 - padding); }
			this.calcBottomY = function (x) { return h - this.calcTopY(x) }
			break;
		case 'combinational':
			this.calcTopY = function (x) { return Math.round(h / 2 - ((h - 2 * padding) / 2) / ((w - 2 * padding) / 2) * Math.sqrt(Math.pow((w - 2 * padding) / 2, 2) - Math.pow(x - w / 2, 2))); }
			this.calcBottomY = function (x) { return h - this.calcTopY(x); }
			this.calcLeftX = function (y) { return Math.round(w / 2 - ((w - 2 * padding) / 2) / ((h - 2 * padding) / 2) * Math.sqrt(Math.pow((h - 2 * padding) / 2, 2) - Math.pow(y - h / 2, 2))); }
			this.calcRightX = function (y) { return w - this.calcLeftX(y); }
			break;
		case 'demux':
			this.calcTopY = function (x) { return Math.min(Math.round((x - padding) * (-1/2) + (w/2)), h/2 - padding); }
			this.calcBottomY = function (x) { return h - this.calcTopY(x) }
			break;
		case 'crossbar':
			this.calcTopY = function (x) {
				if (x < w / 2) {
					return Math.min(Math.round((x - padding) * (1/2) + padding), h/2 - padding);
				} else {
					return Math.min(Math.round((x - padding) * (-1/2) + (w/2)), h/2 - padding);
				}
			}
			this.calcBottomY = function (x) { return h - this.calcTopY(x) }
			break;
		case 'and':
			this.calcTopY = function(x) {
				if (x < w / 2) {
					return padding;
				} else {
					const b = new Bezier(w/2,padding, w-padding,padding, w-padding,h-padding, w/2,h-padding);
					const intersects = b.intersects({ p1: {x:x, y:0}, p2: {x:x,y:h} });
					const points = intersects.map(t => b.get(t));
					const min = Math.round(Math.min(...points.map(p=>p.y)));
					return min;
				}
			}
			this.calcRightX = function(y) {
					const b = new Bezier(w/2,padding, w-padding,padding, w-padding,h-padding, w/2,h-padding);
					const intersects = b.intersects({ p1: {x:0, y:y}, p2: {x:w,y:y} });
					const points = intersects.map(t => b.get(t));
					const max = Math.round(Math.max(...points.map(p=>p.x)));
					return max;
			}
			this.calcBottom = function(x) { return h - this.calcTopY(x) }
			break;
		case 'port':
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
		case 'and':
			{
				// proportions from
				// drawio/src/main/webapp/stencils/electrical/logic_gates.xml 
				//
				//    X0  X1 
				// Y0  A--B
				//     |   )
				// Y1  E--D
				const X0 = padding;
				const X1 = w/2;
				const Y0 = padding;
				const Y1 = h - padding;
				const RX0 = w/2 - padding;
				const RY0 = h/2 - padding;
				c.begin();
				c.moveTo(X0, Y0);
				c.lineTo(X1, Y0);
				c.arcTo(RX0, RY0, 0, 0, 1, X1, Y1 );
				c.lineTo(X0, Y1);
				c.close();
				c.fillAndStroke();
				break;
			}
		case 'or': {
				// proportions from
				// drawio/src/main/webapp/stencils/electrical/logic_gates.xml 
				//
				//    X0  X1 X2 
				// Y0  A--B.
				// Y1   )   C
				// Y2  E--D'
				const X0 = padding;
				const X1 = (40-15)/65 * w;
				const X2 = w-padding;
				const Y0 = padding;
				const Y1 = h/2;
				const Y2 = h-padding;
				const RX0 = 45/65*w - padding;
				const RY0 = 50/60*h - padding;
				const RX1 = 60/65*w - padding;
				const RY1 = 60/60*h - padding;
				c.begin();
				c.moveTo(X0, Y0);
				c.lineTo(X1, Y0);
				c.arcTo(RX0, RY0, 0, 0, 1, X2, Y1 );
				c.arcTo(RX0, RY0, 0, 0, 1, X1, Y2 );
				c.lineTo(X1, Y2);
				c.arcTo(RX1,RY1, 0, 0, 0, X0, Y0 );
				c.close();
				c.fillAndStroke();
				break;
			}
		case 'xor': {
				// proportions from
				// drawio/src/main/webapp/stencils/electrical/logic_gates.xml 
				//
				//    X0 X1 X2 X3 
				// Y0  F A--B.
				// Y1   ) )   C
				// Y2  G E--D'
				const X0 = (10-15)/65*w + padding
				const X1 = padding;
				const X2 = (40-15)/65 * w;
				const X3 = w-padding;
				const Y0 = padding;
				const Y1 = h/2;
				const Y2 = h-padding;
				const RX0 = 45/65*w - padding;
				const RY0 = 50/60*h - padding;
				const RX1 = 60/65*w - padding;
				const RY1 = 60/60*h - padding;
				c.begin();
				c.moveTo(X1, Y0);
				c.lineTo(X2, Y0);
				c.arcTo(RX0, RY0, 0, 0, 1, X3, Y1 );
				c.arcTo(RX0, RY0, 0, 0, 1, X2, Y2 );
				c.lineTo(X1, Y2);
				c.arcTo(RX1,RY1, 0, 0, 0, X1, Y0 );
				c.close();
				c.fillAndStroke();
				c.begin();
				c.moveTo(X0,Y2);
				c.arcTo(RX1,RY1, 0, 0, 0, X0, Y0 );
				c.stroke();
				break;
		}
		case 'port':
			break;
		case 'sequential':
		default:
			c.begin();
			c.rect(padding, padding, w - 2 * padding, h - 2 * padding);
			c.fillAndStroke();
			break;
	}

	const fontFamily = this.style.fontFamily;
	const fillColor = this.style.fillColor;
	let spacing = Math.round(h / (leftPins.length + 1) / pinSnap) * pinSnap;
	let pinY = spacing;
	leftPins.forEach((p) => {
		drawPin(p, 0, pinY, 0, leftAnchor, leftRot, this.calcLeftX(pinY), externalPins, type_size, drawPins, fontFamily, pinFontSize, fillColor);
		pinY += spacing;
	});

	spacing = Math.round(h / (rightPins.length + 1) / pinSnap) * pinSnap;
	pinY = spacing;
	rightPins.forEach((p) => {
		drawPin(p, w, pinY, 180, rightAnchor, rightRot, w - this.calcRightX(pinY), externalPins, type_size, drawPins, fontFamily, pinFontSize, fillColor);
		pinY += spacing;
	});

	spacing = Math.round(w / (topPins.length + 1) / pinSnap) * pinSnap;
	let pinX = spacing;
	topPins.forEach((p) => {
		drawPin(p, pinX, 0, 90, topAnchor, topRot, this.calcTopY(pinX), externalPins, type_size, drawPins, fontFamily, pinFontSize, fillColor);
		pinX += spacing;
	});

	spacing = Math.round(w / (bottomPins.length + 1) / pinSnap) * pinSnap;
	pinX = spacing;
	bottomPins.forEach((p) => {
		drawPin(p, pinX, h, 270, bottomAnchor, bottomRot, h - this.calcBottomY(pinX), externalPins, type_size, drawPins, fontFamily, pinFontSize, fillColor);
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

function drawPin(pin, x, y, rot, anchor, labelRot, padding, external, size, drawPins, fontFamily, fontSize, fillColor) {
	c.translate(x, y);

	c.rotate(rot, 0, 0, 0, 0);
	var txtOffset = 0;
	var pinOffset = 0;

	if (external) {
		pinOffset -= 10;
	}

	if (pin.draw && drawPins) {
		c.begin();
		c.moveTo(pinOffset, 0);
		if (pin.neg) {
			c.lineTo(padding - size / 6, 0);
		} else {
			c.lineTo(padding, 0);
		}
		c.close();
		c.stroke();
	}
	if (pin.clock) {
		c.begin();
		c.moveTo(padding, 0 - size / 4);
		c.lineTo(padding + size / 4, 0);
		c.lineTo(padding, 0 + size / 4);
		c.close()
		c.stroke();
		txtOffset += size / 4;
	}
	if (pin.neg && pin.draw && drawPins) {
		c.ellipse(padding - size / 6, -size / 12, size / 6, size / 6);
		c.fillAndStroke();
	}
	if (pin.out && pin.draw && drawPins) {
		c.begin();
		c.moveTo(padding - 8, 0);
		c.lineTo(padding - 3, 2);
		c.lineTo(padding - 3, -2);
		c.close()
		c.setFillColor(0);
		c.fillAndStroke();
		c.setFillColor(fillColor);
	}
	if (pin.in && pin.draw && drawPins) {
		c.begin();
		c.moveTo(padding - 8, 2);
		c.lineTo(padding - 3, 0);
		c.lineTo(padding - 8, -2);
		c.close()
		c.setFillColor(0);
		c.fillAndStroke();
		c.setFillColor(fillColor);
	}
	if (pin.inout && pin.draw && drawPins) {
		c.begin();
		c.moveTo(padding - 9, 0);
		c.lineTo(padding - 6, 2);
		c.lineTo(padding - 6, -2);
		c.close()
		c.setFillColor(0);
		c.fillAndStroke();
		c.begin();
		c.moveTo(padding - 4, 2);
		c.lineTo(padding - 1, 0);
		c.lineTo(padding - 4, -2);
		c.close()
		c.setFillColor(0);
		c.fillAndStroke();
		c.setFillColor(fillColor);
	}
	if (pin.notConnected && pin.draw && drawPins) {
		c.begin();
		c.moveTo(pinOffset - size / 8, 0 - size / 8);
		c.lineTo(pinOffset + size / 8, 0 + size / 8);
		c.moveTo(pinOffset - size / 8, 0 + size / 8);
		c.lineTo(pinOffset + size / 8, 0 - size / 8);
		c.close();
		c.stroke();
	}
	
	c.setFontFamily(fontFamily);
	c.setFontSize(fontSize);
	// debugger;
	let labelSize = calculateSize(pin.name, { font: fontFamily, fontSize: fontSize + "px" });
	let labelX = 5 + padding + txtOffset;
	let labelAnchorX = 0;
	let labelY = 0;
	if (anchor == mxConstants.ALIGN_MIDDLE) {
		labelAnchorX += labelSize.width / 2;
		labelX += 5;
		// labelY += labelSize.height / 2;
	}
	c.rotate(labelRot, 0, 0, labelX, 0);
	c.text(labelX - labelAnchorX, labelY, labelSize.width, 0, pin.name, anchor, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
	c.rotate(-labelRot, 0, 0, labelX, 0);
	
	c.rotate(-rot, 0, 0, 0, 0);
	c.translate(-x,-y);
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

function newConnectionConstraint(x, y, w, h, ox, oy) {
	return new mxConnectionConstraint(new mxPoint(0, 0), false, "", x + ox, y + oy);
}

mxShapeRTLEntity.prototype.getConstraints = function (style, w, h) {
	var constr = [];
	var leftPins = parsePins(mxUtils.getValue(this.style, 'left', ''), mxUtils.getValue(this.style, 'leftArr', '').split(','));
	var rightPins = parsePins(mxUtils.getValue(this.style, 'right', ''), mxUtils.getValue(this.style, 'rightArr', '').split(','));
	var topPins = parsePins(mxUtils.getValue(this.style, 'top', ''), mxUtils.getValue(this.style, 'topArr', '').split(','));
	var bottomPins = parsePins(mxUtils.getValue(this.style, 'bottom', ''), mxUtils.getValue(this.style, 'bottomArr', '').split(','));
	var pinFontSize = parseFloat(mxUtils.getValue(this.style, 'pinFontSize', '12'));
	var dir = mxUtils.getValue(this.style, 'direction', 'east');
	var type_size = mxUtils.getValue(this.style, 'type_size', '30');
	var drawPins = mxUtils.getValue(this.style, 'drawPins', false);
	var externalPins = mxUtils.getValue(this.style, 'externalPins', false);
	var padding_label = 10 + (!drawPins || externalPins) * 10;
	var padding_pin = (drawPins && externalPins) * 10;
	var pinSnap = mxUtils.getValue(this.style, 'pinSnap', 10);

	let spacing = Math.round(h / (leftPins.length + 1) / pinSnap) * pinSnap;
	let pinY = spacing;
	leftPins.forEach((p) => {
		constr.push(newConnectionConstraint(0, pinY, w, h, -padding_pin, 0));
		constr.push(newConnectionConstraint(0, pinY, w, h, this.calcLeftX(pinY), 0));
		if (p.name) {
			var txtLength = padding_label;
			if (p.clock) {
				txtLength += type_size / 4;
			}
			txtLength += calculateSize(p.name, { font: this.style.fontFamily, fontSize: pinFontSize + "px" }).width;
			constr.push(newConnectionConstraint(0, pinY, w, h, this.calcLeftX(pinY) + txtLength, 0));
		}
		pinY += spacing;
	});
	spacing = Math.round(h / (rightPins.length + 1) / pinSnap) * pinSnap;
	pinY = spacing;
	rightPins.forEach((p) => {
		constr.push(newConnectionConstraint(w, pinY, w, h, padding_pin, 0));
		constr.push(newConnectionConstraint(w, pinY, w, h, this.calcRightX(pinY) - w, 0));
		if (p.name) {
			var txtLength = padding_label;
			if (p.clock) {
				txtLength += type_size / 4;
			}
			txtLength += calculateSize(p.name, { font: this.style.fontFamily, fontSize: pinFontSize + "px" }).width;
			constr.push(newConnectionConstraint(w, pinY, w, h, this.calcRightX(pinY) - w - txtLength, 0));
		}
		pinY += spacing;
	});
	spacing = Math.round(w / (topPins.length + 1) / pinSnap) * pinSnap;
	let pinX = spacing;
	topPins.forEach((p) => {
		constr.push(newConnectionConstraint(pinX, 0, w, h, 0, -padding_pin));
		constr.push(newConnectionConstraint(pinX, 0, w, h, 0, this.calcTopY(pinX)));
		if (p.name) {
			var txtLength = padding_label;
			if (p.clock) {
				txtLength += type_size / 4;
			}
			txtLength += calculateSize(p.name, { font: this.style.fontFamily, fontSize: pinFontSize + "px" }).width;
			constr.push(newConnectionConstraint(pinX, 0, w, h, 0, this.calcTopY(pinX) + txtLength));
		}
		pinX += spacing;
	});
	spacing = Math.round(w / (bottomPins.length + 1) / pinSnap) * pinSnap;
	pinX = spacing;
	bottomPins.forEach((p) => {
		constr.push(newConnectionConstraint(pinX, h, w, h, 0, padding_pin));
		constr.push(newConnectionConstraint(pinX, h, w, h, 0, this.calcBottomY(pinX) - h));
		if (p.name) {
			var txtLength = padding_label;
			if (p.clock) {
				txtLength += type_size / 4;
			}
			txtLength += calculateSize(p.name, { font: this.style.fontFamily, fontSize: pinFontSize + "px" }).width;
			constr.push(newConnectionConstraint(pinX, h, w, h, 0, this.calcBottomY(pinX) - h - txtLength));
		}
		pinX += spacing;
	});
	return (constr);
}
