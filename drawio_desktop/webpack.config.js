const path = require('path');

module.exports = {
  entry: './src/rtl-plugin.js',
  output: {
    filename: 'rtl-plugin.webpack.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: "source-map"
};
