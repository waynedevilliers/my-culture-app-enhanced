import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Allow intentionally unused names, e.g. `const { password: _password, ...rest } = user`.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Images come from the API or Vercel Blob with unknown sizes, and the
      // moved pages are styled for plain <img>; next/image would change layout.
      '@next/next/no-img-element': 'off',
    },
  },
  {
    // Code moved unchanged from my-culture-frontend. These React Compiler and
    // hook-dependency rules flag patterns that work today; changing them can
    // change behaviour (effects that run once on mount, state set in effects).
    // Turn them back on for a file when it is reworked. New code in src/app,
    // src/lib and tests/ is checked with the full rule set.
    files: [
      'src/components/**',
      'src/sections/**',
      'src/views/**',
      'src/contexts/**',
      'src/hooks/**',
      'src/routes/**',
      'src/services/**',
      'src/utils/**',
      'src/tests/**',
      'src/*.jsx',
    ],
    rules: {
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/use-memo': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
