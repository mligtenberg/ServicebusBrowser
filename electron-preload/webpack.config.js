const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/preload-init.ts',
  target: 'electron-preload',

  plugins: [new webpack.ProgressPlugin()],

  module: {
    rules: [{
      test: /\.(ts|tsx)$/,
      loader: 'ts-loader',
      exclude: [/node_modules/]
    }]
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'preload.bundled.js'
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },

}