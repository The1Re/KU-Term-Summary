// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import sortClassMembers from 'eslint-plugin-sort-class-members';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      'sort-class-members': sortClassMembers,
      'unused-imports': unusedImports,
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          vars: 'all',
        },
      ],
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
      'quotes': [
        'error',
        'single',
        {
          allowTemplateLiterals: true,
        },
      ],
      'unused-imports/no-unused-imports': 'error',
      'lines-between-class-members': [
        'error',
        'always',
        { exceptAfterSingleLine: true },
      ],
      'sort-class-members/sort-class-members': [
        'error',
        {
          order: [
            '[static-properties]',
            '[static-methods]',
            '[conventional-private-properties]',
            '[private-properties]',
            '[properties]',
            '[abstract-methods]',
            'constructor',
            '[conventional-private-methods]',
            '[private-methods]',
            '[methods]',
          ],
          groups: {
            'private-properties': [
              { type: 'property', accessibility: 'private' },
            ],
            'private-methods': [{ type: 'method', accessibility: 'private' }],
            'abstract-methods': [{ type: 'method', abstract: true }],
          },
          accessorPairPositioning: 'getThenSet',
        },
      ],
    },
  },
);