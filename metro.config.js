const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Better Auth requires package exports resolution (enabled by default in Expo SDK 53+)
// Ensure resolver.unstable_enablePackageExports is NOT set to false.

module.exports = config;
