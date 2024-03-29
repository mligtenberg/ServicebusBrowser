const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/main.ts',
  target: 'electron-main',

  plugins: [new webpack.ProgressPlugin()],

  module: {
    rules: [{
      test: /\.(ts|tsx)$/,
      loader: 'ts-loader',
      exclude: [/node_modules/]
    },
    {
      test: /\.node$/,
      loader: 'node-loader'
    }]
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  }
}