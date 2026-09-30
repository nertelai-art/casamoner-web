# 004 · Rendiment i accessibilitat

## Pressupost (mòbil, 4G)

| Mètrica | Objectiu |
| --- | --- |
| LCP | < 2,0 s |
| CLS | < 0,05 |
| INP | < 150 ms |
| JS inicial propi de la portada (sense el runtime de React + Next) | < 25 kB gzip |

> **Revisió (30/09/2026).** La primera versió demanava < 130 kB de JS inicial
> total. Mesurat en una build de producció, el runtime de React 19 + Next 16
> ja en fa ≈ 127 kB gzip sense cap línia nostra, així que era un objectiu
> impossible. El pressupost passa a comptar el que controlem. Mesura actual:
> ≈ 21 kB de codi propi; Leaflet (≈ 42 kB) fora de la càrrega inicial;
> `polyfills` (≈ 39 kB) és `nomodule` i els navegadors moderns no el baixen.

## Criteris

- **R-1** Totes les pàgines són estàtiques (SSG); sense dades en temps
  d'execució al servidor.
- **R-2** Imatges amb `next/image` (AVIF/WebP, `sizes` correctes). Només la
  imatge de la capçalera té prioritat.
- **R-3** Tipografies autoallotjades amb `next/font` i `display: swap`.
- **R-4** Leaflet (≈40 kB gzip) es carrega amb `import()` dinàmic quan la
  secció del mapa és a prop de la vista. (three.js es va fer servir a la v2 de
  les escenes i s'ha tret: ara totes són fotos reals.)
- **R-5** Les animacions només toquen `transform`, `opacity`, `filter` i
  `clip-path`; cap propietat que forci *layout*. Un sol bucle `rAF` per escena,
  aturat quan l'escena és fora de pantalla.
- **R-6** Contrast AA, focus visible, navegació per teclat al mapa i al
  llistat, i `prefers-reduced-motion` respectat (M-4).
- **R-7** Capçaleres de caché llargues per a `/images/*` i seguretat bàsica
  (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
