export default {
  // Backend uses Biome for formatting and linting
  'apps/backend/src/**/*.{ts,tsx}': ['biome check --write --no-errors-on-unmatched'],

  // All other TS/TSX files use Prettier + ESLint
  '!(apps/backend)/**/*.{ts,tsx}': ['prettier --write', 'eslint --fix'],
  '*.{ts,tsx}': ['prettier --write', 'eslint --fix'],

  // JSON/MD files — Prettier only
  '**/*.{json,md}': ['prettier --write'],
}
