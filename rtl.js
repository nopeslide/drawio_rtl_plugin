
var mux = require("./shapes/mux.js")
var entity = require("./shapes/entity.js")
var bus = require("./shapes/bus.js")

// export ui for debugging
Draw.loadPlugin(function(ui){window.ui=ui;});


Draw.loadPlugin(function(ui) {
  // Adds custom sidebar entry
  ui.sidebar.addRTLPalette();
});

Sidebar.prototype.addRTLPalette = function() {
  this.addPaletteFunctions('rtl','RTL', true, [
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.mux;',  80, 120, 'Mux', 'Mux', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'mux', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;container=1;collapsible=0;',  80, 120, 'Entity', 'Entity', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'entity', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;left=,:clk;right=,:np;top=0;bottom=0;drawPins=0;snapToPoint=1;resizable=0;editable=1;',  40, 60, '', 'Register', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'reg', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;verticalAlign=top;spacing=0;spacingTop=7;left=1;right=:n;top=0;bottom=0;drawPins=1;snapToPoint=1;resizable=0;editable=0;',  60, 60, '1', 'NOT', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'not', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;verticalAlign=top;spacing=0;spacingTop=7;left=2;right=1;top=0;bottom=0;drawPins=1;snapToPoint=1;resizable=0;editable=0;',  60, 60, '&', 'AND', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'and', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;verticalAlign=top;spacing=0;spacingTop=7;left=2;right=:n;top=0;bottom=0;drawPins=1;snapToPoint=1;resizable=0;editable=0;',  60, 60, '&', 'NAND', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'nand', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;verticalAlign=top;spacing=0;spacingTop=7;left=2;right=1;top=0;bottom=0;drawPins=1;snapToPoint=1;resizable=0;editable=0;',  60, 60, '≥1', 'OR', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'or', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;verticalAlign=top;spacing=0;spacingTop=7;left=2;right=:n;top=0;bottom=0;drawPins=1;snapToPoint=1;resizable=0;editable=0;',  60, 60, '≥1', 'NOR', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'nor', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;verticalAlign=top;spacing=0;spacingTop=7;left=2;right=1;top=0;bottom=0;drawPins=1;snapToPoint=1;resizable=0;editable=0;',  60, 60, '=1', 'XOR', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'xor', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=1;shape=mxgraph.rtl.abstract.entity;verticalAlign=top;spacing=0;spacingTop=7;left=2;right=:n;top=0;bottom=0;drawPins=1;snapToPoint=1;resizable=0;editable=0;',  60, 60, '=1', 'XNOR', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'xnor', 'rtl ').join(' ')),
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=2;shape=mxgraph.rtl.abstract.bus;labelPosition=center;verticalLabelPosition=top;verticalAlign=bottom;',  10, 80, 'Bus', 'Bus', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'bus', 'rtl ').join(' '))
  ]);
}
  
