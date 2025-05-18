// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      eslintPluginPrettierRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/cyclomatic-complexity': ['error', 5],

      '@angular-eslint/template/accessibility-alt-text': 'error',
      '@angular-eslint/template/accessibility-table-scope': 'error',
      '@angular-eslint/template/no-positive-tabindex': 'error',

      '@angular-eslint/template/use-track-by-function': 'error',
      '@angular-eslint/template/no-call-expression': 'error',

      '@angular-eslint/template/no-duplicate-attributes': 'error',
      '@angular-eslint/template/no-inline-styles': 'error',

      '@angular-eslint/prefer-on-push-component-change-detection': 'error',

      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'explicit',
          overrides: {
            конструкторы: 'no-public',
          },
        },
      ],
      '@typescript-eslint/no-unused-vars': 'error',
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      'no-commented-out-code': 'error',
      'no-magic-numbers': [
        'error',
        {
          ignore: [-1, 0, 1],
          ignoreArrayIndexes: true,
        },
      ],
    },
  }

  // {
  //   files: ["*.html"],
  //   excludedFiles: ["*inline-template-*.component.html"],
  //   extends: [eslintPluginPrettierRecommended],
  //   rules: {
  //     // NOTE: WE ARE OVERRIDING THE DEFAULT CONFIG TO ALWAYS SET THE PARSER TO ANGULAR (SEE BELOW)
  //     "prettier/ prettier": ["error", { "parser": "angular" }]
  //   }
  // }
);
