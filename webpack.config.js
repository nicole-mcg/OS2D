var path = require('path');
var webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, ''),
        filename: 'index.js'
    },
    module: {
        rules: [
            {
                exclude: /(node_modules)/,
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                },
                resolve: { extensions: [".js"] }
            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
};