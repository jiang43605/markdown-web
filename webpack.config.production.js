const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    context: __dirname + '/src',
    entry: {
        common: './js/index.js',
        manage: './js/manage.js'
    },
    output: {
        path: __dirname + '/dist',
        filename: '[name].min.js',
        publicPath: '/dist/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['react', 'env']
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    }, {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [
                                require('autoprefixer')({
                                    browsers: ['last 10 versions']
                                })
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.woff$/,
                exclude: /node_module/,
                use: 'url-loader?limit=1024'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            filename: 'index.html',
            inject: 'body',
            chunks: ['common']
        }),
        new HtmlWebpackPlugin({
            template: './manage.html',
            filename: 'manage.html',
            inject: 'body',
            chunks: ['manage']
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            output: {
                comments: false,
            }
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        })
    ]
}