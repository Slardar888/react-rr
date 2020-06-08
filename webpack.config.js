const path = require('path')

module.exports = {
  entry: {
    dr: './src/dr.js'
  },
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: require.resolve("babel-loader"),
          options: {
            presets: [
              require.resolve("@babel/preset-env"),
              require.resolve("@babel/preset-react")
            ],
            plugins: [
              require.resolve("@babel/plugin-transform-runtime"),
              require.resolve("@babel/plugin-proposal-object-rest-spread"),
              [require.resolve("@babel/plugin-proposal-decorators"), { "legacy": true }],
              [require.resolve("@babel/plugin-proposal-class-properties"), { "loose": true }]
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          require.resolve('style-loader'),
          require.resolve('css-loader')
        ]
      }
    ]
  }
}
