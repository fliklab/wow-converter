const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: {
      module: {
        rules: [
          {
            test: /\.md$/,
            use: "raw-loader",
          },
        ],
      },
      resolve: {
        fallback: {
          buffer: require.resolve("buffer/"),
        },
      },
      plugins: [
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
        }),
      ],
    },
  },
};
