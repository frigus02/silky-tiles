const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        path: '.',
        publicPath: '/',
        filename: 'silky-tiles.js',
        library: 'SilkyTiles',
        libraryTarget: 'var',
        devtoolModuleFilenameTemplate: function (info) {
            if (info.resourcePath.startsWith('src/')) {
                return `http://webpack-src/${info.resourcePath}`;
            } else {
                return `http://webpack-xtra/${info.resourcePath}`;
            }
        }
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel?cacheDirectory'
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('silky-tiles.css', {allChunks: true})
    ],
    devtool: '#cheap-module-eval-source-map'
};
