var webpack = require('webpack');
var path = require('path');

module.exports = {
    devtool: 'inline-source-map',
    entry: [
      'babel-polyfill',
      './index.js'
    ],
    output: {
        path: __dirname,
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel' }
        ]
    },
    resolve: {
      alias: {
        'mobx-reactor': path.join(__dirname, '..', '..', 'src')
      }
    }
}
