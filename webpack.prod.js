const {merge} = require('webpack-merge');
const ClosurePlugin = require('closure-webpack-plugin');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    minimizer: [new ClosurePlugin({mode: 'STANDARD'})],
  },
});
