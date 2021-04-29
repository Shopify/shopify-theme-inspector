const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const ClosurePlugin = require('closure-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimizer: [
      new ClosurePlugin({mode: 'STANDARD'})
    ]
  }
});
