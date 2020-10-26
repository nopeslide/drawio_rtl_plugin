# Draw.io RTL Plugin

This draw.io plugins provides custom elements for RTL diagrams:

* basic gates
* bus
* sequential logic
* combinational logic
* datastructure symbols
* connectable edges

configurable via properties.


## Overview

![](/doc/overview.dio.png)

<!-- ## Online Demo -->
<!-- [Online Demo](https://nopeslide.github.io/drawio/?p=rtl) -->

## Usage

* Just edit the properties of a node and it will be redrawn with the new options

<!-- ![](/doc/demo.gif) -->


## How to build

1. `git clone --recursive https://github.com/nopeslide/drawio_rtl_plugin.git ~/drawio_rtl_plugin`
2. `cd ~/drawio_rtl_plugin/drawio_desktop`
3. `npm install`
4. `npm run build`

# How to install

5. open draw.io desktop
6. select on the top menu bar `Extras`/`Plugins...`
7. click `Add`
8. click `Select File...` for `External Plugins:`
9. select `~/drawio_rtl_plugin/drawio_desktop/dist/rtl-plugin.webpack.js`
10. click `OK`
11. click `Apply`
12. confirm Dialog

__Draw.io copies the plugin into an internal directory, making updates impossible!__

To link the plugin with the repository:

13. run `ln -sfr ~/drawio_rtl_plugin/drawio_desktop/dist/rtl-plugin.webpack.js ~/.config/draw.io/plugins/`