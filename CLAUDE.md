# casamoner · notes per a agents

Valen les regles de casa. Aquí només el que és propi d'aquest repositori.

## Abans de tocar res

- Llegeix la spec de la funcionalitat a `docs/specs/`. Si el canvi no hi encaixa,
  primer s'actualitza la spec (SDD), després la prova (TDD), després el codi.
- `pnpm check` ha de quedar en verd.

## Fronteres (les fa complir ESLint)

- `src/domain`, `src/lib/motion`, `src/lib/scenes`, `src/lib/seo`: TypeScript pur.
  Res de React, Next, Leaflet ni components.
- `leaflet` només es pot importar des de `src/components/map/leaflet/`.
- `three` i `@react-three/*` només dins `src/components/three/canvas-kit.tsx` i
  els `*Canvas.tsx`, que es carreguen amb `next/dynamic` (`ssr: false`).

## Escenes animades

- El model (`src/lib/scenes/*.ts`) és una funció pura `progrés → estat`. Tota
  la lògica de temps va aquí i es prova aquí.
- La vista escriu estils a refs dins `onFrame`; **no** facis `setState` per
  fotograma.
- Escenes 3D: segueix la guia `scroll-3d-scenes` (frameloop «demand», `damp`
  amb delta limitat, zero objectes nous per fotograma). Les peces comunes són a
  `src/components/three/canvas-kit.tsx`.
- Escenes de foto: les capes surten de `pnpm scenes` (`scripts/scene-layers.ts`).
  La geometria del panettone és a `src/data/scenes/panettone-geometry.json`; si
  canvies una foto, regenera les capes i mira-les en clar i en fosc.
- Res de `Math.random()` ni `Date.now()` als models: PRNG amb llavor
  (`lib/motion/prng.ts`); l'hora entra per paràmetre (`useNow` és l'únic lloc
  que llegeix el rellotge).

## Local

- `pnpm dev` va amb `--webpack` perquè el Control d'aplicacions de Windows
  bloqueja el SWC natiu en aquesta màquina. No ho canviïs a Turbopack.
- Per mirar les escenes, fes scroll de debò: el progrés depèn de la posició.
