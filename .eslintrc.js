module.exports = {
  root: true,
  extends: ['@react-native-community/eslint-config', 'eslint-config-prettier'],
  rules: {
    'prettier/prettier': 0,
    // not interesting for rescript generated js
    'no-bitwise': 0,
    'no-shadow': 0,
    'no-unused-vars': 0,
    'no-useless-escape': 0,
  },
  env: {
    'jest/globals': true,
  },
  plugins: ['detox'],
  overrides: [
    {
      files: ['*.e2e.js'],
      env: {
        'detox/detox': true,
        jest: true,
        'jest/globals': true,
      },
    },
  ],
};
