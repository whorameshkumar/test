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
            // if u need rules refer - eslint.org/docs/latest/rules -> Jis mein settings icon enable hai wo cheezain code mein eslint khud fix krdye gaa
            ...tsPlugin.configs['recommended'].rules,
            ...tsPlugin.configs['recommended-requiring-type-checking'].rules,
            'no-console': 'error',
            'dot-notation': 'error',
            '@typescript-eslint/no-misused-promises': 'off',
            '@typescript-eslint/require-await': 'off',
        },
    },
    {
        ignores: [ // so I am ignoring these all files 
            'dist/**', // Add this line to ignore the dist directory because dist folder mein hum n sirf JS kaa code dekhnye k liye create kra tha
            'node_modules/**',
            '*.spec.ts',
            'tests/**'], 
    },
];
