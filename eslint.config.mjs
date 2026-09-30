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
    // three.js (~250 kB) només als canvas carregats amb import() diferit.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/components/three/canvas-kit.tsx', 'src/components/scenes/**/*Canvas.tsx', 'src/components/map/leaflet/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: 'leaflet', message: 'Usa MapView (src/components/map).' }],
          patterns: [
            { regex: '^(three|@react-three/[^/]+)(/.*)?$', message: 'three.js només dins dels *Canvas.tsx (càrrega diferida).' },
          ],
        },
      ],
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
