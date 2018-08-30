var path = require('path');
var webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'test/'),
        filename: 'index.js'
    },
    module: {
        rules: [
            {
                exclude: /(node_modules)/,
                test: /\.(ts|js)$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['env'],
                        },
                    },
                    {
                        loader: 'ts-loader',
                    },
                ],
                resolve: { extensions: [".ts", ".js"] }
            }
        ]
    },
    stats: {
        colors: true
    },
    devtool: 'source-map'
};