const createExpoWebpackConfigAsync = require("@expo/webpack-config");
const path = require("path");

// Expo CLI will await this method so you can optionally return a promise.
module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  // If you want to add a new alias to the config.
  config.resolve.alias["react-native-agora"] = path.resolve(
    __dirname,
    "./src/utils/mock.js"
  );

  // turn off compression in dev mode.
  if (config.mode === "development") {
    config.devServer.compress = false;
  }
  return config;
};
