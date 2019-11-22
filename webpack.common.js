const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background.ts',
    popup: './src/popup.ts',
    devtools: './src/devtools.ts',
    detectShopify: './src/detectShopify.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new HtmlWebpackPlugin({
      filename: 'devtools.html',
      template: 'src/devtools.html',
      chunks: ['devtools'],
    }),
    new HtmlWebpackPlugin({
      filename: 'popupAuthFlow.html',
      template: 'src/popupAuthFlow.html',
      chunks: ['popup'],
    }),
    new HtmlWebpackPlugin({
      filename: 'popupNotShopifyStore.html',
      template: 'src/popupNotShopifyStore.html',
      chunks: ['popup'],
    }),
    new CopyPlugin(
      [{from: 'src/manifest.json'}, {from: 'src/images', to: 'images'}],
      {copyUnmodified: true},
    ),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
};
