const path = require('path');
const { getConfig } = require('react-native-builder-bob/babel-config');
const pkg = require('../package.json');

const root = path.resolve(__dirname, '..');

// babel-preset-expo is nested inside expo's node_modules due to
// nmHoistingLimits: workspaces — resolve it explicitly so it works
// in all contexts (Metro, @expo/require-utils, etc.)
const babelPresetExpo = require.resolve('babel-preset-expo', {
  paths: [
    require
      .resolve('expo/package.json', { paths: [__dirname] })
      .replace('/package.json', ''),
  ],
});

module.exports = function (api) {
  api.cache(true);

  return getConfig(
    {
      presets: [babelPresetExpo],
    },
    { root, pkg }
  );
};
