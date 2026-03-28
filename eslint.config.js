import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'

export default [
    {
        files: ['**/*.{ts,mts}'],
        languageOptions: { parser: tsparser },
        plugins: { '@typescript-eslint': tseslint },
        rules: {
            'no-param-reassign': 'warn',
            ...tseslint.configs.recommended.rules,
        },
    },
]
