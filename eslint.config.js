const js = require('@eslint/js');
const globals = require('globals');
const prettier = require('eslint-config-prettier');

module.exports = [
  { ignores: ['node_modules/**', 'coverage/**', 'src/assets/**'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'commonjs', globals: globals.node },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }] }
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.jest } }
  },
  {
    // Scripts do navegador (carregados por <script>, sem módulos)
    files: ['src/**/*.js'],
    languageOptions: { sourceType: 'script', globals: { ...globals.browser, showMessage: 'readonly' } },
    rules: { 'no-unused-vars': 'off' }
  },
  {
    files: ['src/scripts/ui.js'],
    languageOptions: { globals: { showMessage: 'off' } }
  },
  prettier
];
