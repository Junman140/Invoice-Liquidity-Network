/**
 * Single source of truth for commit message AND PR title linting.
 * `.github/workflows/pr-title-lint.yml` runs:
 *   pnpm exec commitlint --config commitlint.config.js --edit pr_title
 * Keep CONTRIBUTING.md in sync when changing `type-enum`.
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      // Must stay identical to the list documented in CONTRIBUTING.md
      ['feat', 'fix', 'docs', 'chore', 'test', 'refactor', 'perf', 'ci', 'design', 'build'],
    ],
  },
};
