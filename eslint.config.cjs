/* eslint-env node - specifies the TypeScript parser and includes a couple of custom rules. */
const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const globals = require('globals');

module.exports = [
    js.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: true,
                //tsconfigRootDir: __dirname,
            },
            globals: {
                ...globals.node,
            },
        },
        rules: {
            ...tsPlugin.configs['recommended'].rules,
            ...tsPlugin.configs['recommended-requiring-type-checking'].rules,
            'no-console': 'warn', // Changed from 'error' to 'warn'
            'dot-notation': 'error',
            '@typescript-eslint/no-misused-promises': 'off',
            '@typescript-eslint/require-await': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
            '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
        },
    },
    {
        files: ['**/*.js', '**/*.mjs'],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest, // Add Jest globals
            },
        },
        rules: {
            'no-undef': 'error',
            'no-console': 'warn',
        },
    },
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            '*.spec.ts',
            'tests/**',
            '*.spec.js', // Add this to ignore Jest test files
        ],
    },
];