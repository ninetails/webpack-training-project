/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

const minifyHtml = !isProduction ? false : {
  removeAttributeQuotes: true,
  collapseWhitespace: true,
  html5: true,
  minifyCSS: true,
  removeComments: true,
  removeEmptyAttributes: true,
};

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'eval',
  entry: {
    main: './src/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'public', 'build'),
    filename: '[name].[chunkhash].js',
    publicPath: '/build/',
  },
  optimization: {
    runtimeChunk: true,
    splitChunks: {
      cacheGroups: {
        vendor: {
          chunks: 'all',
          test: path.resolve(__dirname, 'node_modules'),
          name: 'vendors',
          enforce: true,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        // Babel options are loaded from .babelrc
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.svg$/,
        loader: 'file-loader',
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin([
      path.resolve(__dirname, 'public', 'build'),
      path.resolve(__dirname, 'public', 'index.html'),
    ]),
    // Emit HTML files that serve the app
    new HtmlWebpackPlugin({
      template: 'src/templates/landing.html',
      filename: path.resolve(__dirname, 'public/index.html'),
      alwaysWriteToDisk: true,
      minify: minifyHtml,
    }),
    new HtmlWebpackPlugin({
      template: 'src/templates/app.html',
      filename: path.resolve(__dirname, 'public/users/index.html'),
      alwaysWriteToDisk: true,
      minify: minifyHtml,
    }),
    new MomentLocalesPlugin(),
  ].concat(
    isProduction
      ? []
      : [
          // Force writing the HTML files to disk when running in the development mode
          // (otherwise, webpack-dev-server won’t serve the app)
          new HtmlWebpackHarddiskPlugin(),
        ],
  ).concat(
    process.env.npm_lifecycle_event === 'analyze'
      ? [
          new BundleAnalyzerPlugin(),
        ]
      : []
  ),
  devServer: {
    contentBase: path.join(__dirname, 'public'),
  },
};
