module.exports = {
  root: true,
  extends: ['@react-native-community/eslint-config', 'eslint-config-prettier'],
  rules: {
    'prettier/prettier': 0,
    // not interesting for rescript generated js
    'no-shadow': 0,
    'no-bitwise': 0,
    'no-useless-escape': 0,
  },
  env: {
    'jest/globals': true,
  },
};
