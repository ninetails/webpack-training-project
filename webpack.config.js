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
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const PWAManifestPlugin = require('webpack-pwa-manifest');
const ResourceHintWebpackPlugin = require('resource-hints-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

const SW_CACHE_ID = 'nyancat';
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
      path.resolve(__dirname, 'public', 'index.html.gz'),
      path.resolve(__dirname, 'public', 'users', 'index.html'),
      path.resolve(__dirname, 'public', 'users', 'index.html.gz'),
      path.resolve(__dirname, 'public', 'manifest.json'),
      path.resolve(__dirname, 'public', 'manifest.json.gz'),
      path.resolve(__dirname, 'public', 'sw.js'),
      path.resolve(__dirname, 'public', 'sw.js.gz'),
    ], { verbose: false }),
    // Emit HTML files that serve the app
    new HtmlWebpackPlugin({
      template: 'src/templates/landing.html',
      filename: path.resolve(__dirname, 'public/index.html'),
      alwaysWriteToDisk: true,
      minify: minifyHtml,
      inlineSource: 'runtime.*.js$',
      prefetch: ['/global.css', '/landing-imgs/profile.png', '**/manifest*', '**/vendors.*', '**/main.*', '**/home.*'],
      preload: ['/global.css', '/landing-imgs/profile.png', '**/manifest*', '**/vendors.*', '**/main.*', '**/home.*'],
    }),
    new HtmlWebpackPlugin({
      template: 'src/templates/app.html',
      filename: path.resolve(__dirname, 'public/users/index.html'),
      alwaysWriteToDisk: true,
      minify: minifyHtml,
      inlineSource: 'runtime.*.js$',
      prefetch: ['**/*.svg', '/global.css', '**/manifest*', '**/vendors.*', '**/main.*', '**/user.*'],
      preload: ['**/*.svg', '/global.css', '**/manifest*', '**/vendors.*', '**/main.*', '**/user.*'],
    }),
    new MomentLocalesPlugin(),
    new ResourceHintWebpackPlugin(),
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'async',
      inline: /runtime.*\.js$/,
    }),
    new SWPrecacheWebpackPlugin({
      cacheId: SW_CACHE_ID,
      dontCacheBustUrlsMatching: /(\.\w{8}\.)/,
      filename: '../sw.js',
      minify: true,
      staticFileGlobsIgnorePatterns: [/^\/.*\.html(\.gz)?$/, /\.map$/, /manifest.*\.json$/],
      staticFileGlobs: [
        'public/global.css',
        'public/global.css.gz',
        'public/landing-imgs/profile.png',
        'public/',
        'public/index.html',
        'public/index.html.gz',
        'public/users/',
        'public/users/index.html',
        'public/users/index.html.gz',
      ],
      stripPrefix: 'public',
      mergeStaticsConfig: true,
    }),
    new PWAManifestPlugin({
      name: 'LitHub',
      short_name: 'LitHub',
      description: 'LitHub is a super-light open-source site. It features a slick UI and is optimized to use as little data as possible',
      start_url: '/',
      icons: [{
        src: path.resolve(__dirname, 'icon_1024.png'),
        sizes: [96, 128, 192, 256, 384, 512, 1024],
      }],
    }),
  ].concat(
    isProduction
      ? [
          new CompressionPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.(html|css|js|json)$/,
          }),
        ]
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
