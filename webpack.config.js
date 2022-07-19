const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: './src/main.ts',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    mode: "development",
    plugins: [
        new HtmlWebpackPlugin({template: './src/index.html'}),
        new UglifyJsPlugin({
            uglifyOptions: {
                compress: {
                    drop_console: true
                }
            },
            sourceMap: true,
            parallel: true
        })
    ]
};
