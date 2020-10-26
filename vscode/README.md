# Drawio.io Integration: RTL Plugin

This is an extension for
[Draw.io Integration](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio)
or
[Draw.io Integration - Insider Build](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio)
that adds RTL support.

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

![](/doc/demo.gif)

## Installation
* [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=nopeslide.vscode-drawio-plugin-rtl)
* [OpenVSX Marketplace](https://open-vsx.org/extension/nopeslide/vscode-drawio-plugin-rtl)

## How to build

1. `git clone --recursive https://github.com/nopeslide/drawio_rtl_plugin.git`
2. `cd drawio_rtl_plugin/drawio_desktop`
3. `npm install`
4. `npm run build`
5. `cd ../vscode`
6. `npm install`
7. `npm run vscode:package`
