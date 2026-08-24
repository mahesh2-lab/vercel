const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Better Auth requires package exports resolution (enabled by default in Expo SDK 53+)
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
