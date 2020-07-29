const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',

  entry: {
    quotes: './src/quotes.js',
    equity: './src/equity.js'
  },

  output: {
    path: __dirname + '/dist',
    filename: '[name].js' // [шаблон] для нескольких файлов
  },

  // watch: true,
  // watchOptions: {
  //   aggregateTimeout: 300
  // },

  plugins: [
    new CleanWebpackPlugin()
  ],


  // module: {
  //   loaders: [{
  //     loader: 'babel',
  //     test: /\.js$/,
  //   }]
  // }

}
