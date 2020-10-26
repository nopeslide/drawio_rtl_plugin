import "./shapes/shapeEntity";
import "./shapes/shapeBus";
import "./palettes/rtl/paletteRTL"

// export ui for debugging
Draw.loadPlugin(function(ui){window.ui=ui;});
  
Draw.loadPlugin(function(ui) {
  ui.editor.graph.setConnectableEdges(true);
  ui.sidebar.addRTLPalette();
});
