const { withAppBuildGradle } = require('expo/config-plugins');

function withAbiSplits(config) {
  return withAppBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('splits {')) {
      config.modResults.contents = config.modResults.contents.replace(
        /android\s*{/,
        `android {
    splits {
        abi {
            enable true
            reset()
            include "arm64-v8a"
            universalApk false
        }
    }`
      );
    }
    return config;
  });
};

module.exports = withAbiSplits;