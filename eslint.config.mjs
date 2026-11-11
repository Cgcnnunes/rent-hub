import js from '@eslint/js';
import next from 'eslint-config-next/core-web-vitals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/.nx/**',
      '**/dist/**',
      '**/test-results/**',
      '**/playwright-report/**',
      '**/next-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...next,
  {
    settings: { next: { rootDir: 'apps/web/' } },
    rules: {
      'import/no-anonymous-default-export': 'off',
      'sort-imports': ['error', { ignoreDeclarationSort: true }],
    },
  },
  {
    files: ['**/*.cjs', '**/*.mjs'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        console: 'readonly',
        module: 'readonly',
        process: 'readonly',
        require: 'readonly',
      },
    },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
];
