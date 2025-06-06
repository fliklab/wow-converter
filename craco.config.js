const path = require("path");

module.exports = {
  webpack: {
    alias: {
      path: require.resolve("path-browserify"),
    },
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        fs: false,
        os: false,
        path: require.resolve("path-browserify"),
      };

      return webpackConfig;
    },
  },
};
