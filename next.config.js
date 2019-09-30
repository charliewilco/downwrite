const withCSS = require("@zeit/next-css");

module.exports = withCSS({
  target: "serverless",
  webpack(config, { isServer }) {
    if (isServer) {
      const origExternals = [...config.externals];
      config.externals = [
        (context, request, callback) => {
          if (typeof origExternals[0] === "function") {
            origExternals[0](context, request, callback);
          } else {
            callback();
          }
        },
        ...(typeof origExternals[0] === "function" ? [] : origExternals),
        mocks
      ];
    }

    return config;
  }
});

const mocks = {
  bcrypt: "bcrypt",
  jsonwebtoken: "jsonwebtoken",
  "node-pre-gyp": "node-pre-gyp",
  mongoose: "mongoose",
  "apollo-server-micro": "apollo-server-micro",
  "aws-sdk": "aws-sdk"
};
