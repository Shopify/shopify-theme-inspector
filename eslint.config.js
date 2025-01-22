const shopify = require('@shopify/eslint-plugin');
const parser = require('@typescript-eslint/parser');

module.exports = [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      shopify: shopify,
    },
    rules: {
      'import/extensions': 'off',
      'jsx-a11y/control-has-associated-label': 'off',
      'node/no-extraneous-require': 'off',
      'import/no-cycle': 'off',
      'callback-return': 'off',
      'import/named': 'off',
      'func-style': 'off',
      'shopify/jsx-no-hardcoded-content': 'off',
      'shopify/restrict-full-import': ['error', 'lodash'],
    },
  },
];