const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSVGPlugin = require('html-webpack-inline-svg-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      buffer: require.resolve('buffer'),
    },
  },
  entry: {
    background: './src/background.ts',
    popup: './src/popup.ts',
    devtools: './src/devtools.ts',
    speedscope: './src/components/speedscope.ts',
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
      filename: 'speedscope.html',
      template: 'src/resources/speedscope/index.html',
      chunks: ['speedscope'],
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
    new HtmlWebpackInlineSVGPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          force: true,
        },
        {
          from: 'src/images',
          to: 'images',
          force: true,
        },
        {
          from: 'src/resources/speedscope',
          to: 'speedscope',
          force: true,
        },
      ],
    }),
  ],
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
};
