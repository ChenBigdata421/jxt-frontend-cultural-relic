module.exports = {
  configureWebpack: {
    output: {
      filename: '[name].[contenthash].js',
      chunkFilename: '[name].[contenthash].js',
    },
    optimization: {
      runtimeChunk: 'single', // This will create a separate runtime file
    },
  },
  productionSourceMap: false, // Disable source maps for production
};
