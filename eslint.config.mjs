import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Leaflet és un proveïdor: només es pot importar des de la seva frontera.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/components/map/leaflet/**'],
    rules: {
      'no-restricted-imports': ['error', { paths: [{ name: 'leaflet', message: 'Usa MapView (src/components/map).' }] }],
    },
  },
  {
    // El domini i la lògica pura no depenen del framework (spec 000).
    files: ['src/domain/**', 'src/lib/motion/**', 'src/lib/scenes/**', 'src/lib/seo/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['react', 'react-dom', 'next', 'next/*', 'leaflet'], message: 'El domini ha de ser TypeScript pur.' },
            { group: ['@/components/*', '@/app/*'], message: 'El domini no pot dependre de la UI.' },
          ],
        },
      ],
    },
  },
  globalIgnores(['.next/**', 'out/**', 'next-env.d.ts', 'assets-src/**', 'coverage/**']),
]);
