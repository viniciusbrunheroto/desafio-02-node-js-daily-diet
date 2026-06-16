import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import tseslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
      semi: ['error', 'never'],
      quotes: ['error', 'single'],
      indent: ['error', 2]
    },
  },
];

export default eslintConfig;
