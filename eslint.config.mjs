import nx from '@nx/eslint-plugin';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc', '**/vitest.config.*.timestamp*'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mts', '**/*.mjs'],
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      // Blank line between external packages and internal/local imports.
      // Group 1: external npm packages (everything except @custom-forms and relative paths)
      // Group 2: internal monorepo packages (@custom-forms/*) and relative imports
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^(?!@custom-forms)@', '^[a-z]', '^node:'],
            ['^@custom-forms', '^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
    rules: {
      // Require explicit return types on class methods and exported functions.
      // allowExpressions: inline callbacks/lambdas are exempt.
      // allowTypedFunctionExpressions: typed const arrows (CanActivateFn, HttpInterceptorFn…) are exempt.
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
      // Allow empty arrow functions — standard pattern for ControlValueAccessor
      // default callbacks (onChange, onTouched) that get replaced at runtime.
      '@typescript-eslint/no-empty-function': [
        'error',
        { allow: ['arrowFunctions'] },
      ],
    },
  },
];
