var nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'electron-renderer',
  externals: [ nodeExternals() ]
}