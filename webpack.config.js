const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: './src/main.ts',
    devtool: 'source-map',
    devServer: {
        compress: true,
        port: 8888,
    },
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
