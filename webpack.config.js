const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    mode: 'development',
    entry: './src/app.ts',
    resolve: {
        extensions: ['.js','.ts'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                include: [path.resolve(__dirname,'src')]
            },
            {
                test: /\.css$/,
                use: ['style-loader','css-loader']
            }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname,'public')
    },
    devServer: {
        port: 3000,
        hot: true
    },
    plugins: [ new htmlWebpackPlugin({
        template: "./src/index.html",
        filename: "index.html",
        title: "SSR",
        inject: 'head'
    })]
}