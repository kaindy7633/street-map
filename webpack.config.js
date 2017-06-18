const path = require('path');         //  node 路径模块;
const webpack = require('webpack');   //  webpack模块;
const ExtractTextPlugin = require('extract-text-webpack-plugin');  //  独立打包css模块;
const HtmlWebpackPlugin = require('html-webpack-plugin');          //  html模板模块;

module.exports = {
  // 设置原始文件目录
  context: path.resolve(__dirname, './src'),

  // 调试包
  devtool: '#eval-source-map',

  // 打包入口
  entry: {
    app: './js/app.js',
    vendor: ['knockout']
  },

  // 打包出口
  output: {
    path: path.resolve(__dirname, './dist/'),
    filename: 'js/[name].[hash:8].js',
    publicPath: '/',
    libraryTarget: 'var'
  },

  // // 模块
  module: {
    rules: [
      // 处理js文件
      {
        test: /\.js$/,
        use: [{
          loader: 'babel-loader'
        }]
      },
      // 处理css、scss文件，编译后打包到一个文件
      {
        test: /\.(css|sass|scss)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                minimize: true,
                importLoaders: true
              }
            }
          ]
        })
      }
    ]
  },

  // 插件
  plugins: [
    // 模板插件
    new HtmlWebpackPlugin({
      filename: 'index.html',                    // 设置最后生成文件名称;
      template: path.resolve(__dirname, './src/index.html'),   // 设置原文件;
      inject: true,
      // minify: {
      //   removeComments: true,
      //   collapseWhitespace: true
      // }
    }),

    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest']   // 加入manifest防止vendor重新打包而引起第三方库hash值变化
    }),

    // 独立打包css插件;
    new ExtractTextPlugin({
      filename: 'css/[name].[hash:12].css'                // 设置最后css路径、名称;
    }),

    // webpack内置js压缩插件;
    new webpack.optimize.UglifyJsPlugin({
      compress: {                               // 压缩;
        warnings: false                      // 关闭警告;
      }
    })
  ],

  // 设置本地Server;
  devServer: {
    contentBase: path.join(__dirname, 'dist'),  // 设置启动文件目录;
    port: 8080,
    compress: true   // 设置gzip压缩;
  }
}
