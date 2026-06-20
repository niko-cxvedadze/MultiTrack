/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@repo/eslint-config/base.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: { project: true },
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error'
  },
  ignorePatterns: ['generate.js']
}
