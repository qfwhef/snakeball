const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  configureWebpack: {
    resolve: {
      fallback: {
        process: require.resolve('process/browser'),
      },
    },
    plugins: [
      require('webpack').ProvidePlugin({
        process: 'process/browser',
      }),
    ],
  },
})
