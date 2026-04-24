const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// ADD MOV to assetExts so Metro parses them correctly instead of treating them as JS/Babel code
config.resolver.assetExts.push('mov', 'MOV');

module.exports = withNativeWind(config, {
  input: "./global.css"
});
