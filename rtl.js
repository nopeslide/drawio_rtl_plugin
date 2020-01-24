
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
    this.createVertexTemplateEntry('shadow=0;dashed=0;align=center;html=1;strokeWidth=2;shape=mxgraph.rtl.abstract.bus;labelPosition=center;verticalLabelPosition=top;verticalAlign=bottom;',  10, 80, 'Bus', 'Bus', null, null, this.getTagsForStencil('mxgraph.rtl.abstract', 'bus', 'rtl ').join(' '))
  ]);
}
  
