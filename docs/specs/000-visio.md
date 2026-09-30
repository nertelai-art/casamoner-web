# 000 · Visió i abast

## Objectiu

Substituir la web actual de casamoner (PHP de 2016, una sola pàgina amb
carrusels) per una web app ràpida que **vengui el producte**: que faci venir
ganes de menjar-se'l i que porti la gent a la botiga més propera.

## Públic

1. Gent de Girona i la Costa Brava que busca una fleca/pastisseria a prop.
2. Qui vol encarregar un pastís o un càtering.
3. Cercadors i assistents d'IA que responen «on hi ha pa ecològic a Girona».

## Abast d'aquesta versió (v0.1)

| Dins | Fora (següents iteracions) |
| --- | --- |
| Portada amb seccions: pans, pastissos, dolços, salats, càtering, obrador, botigues, preguntes freqüents, contacte | Botiga en línia / comandes |
| 3 escenes animades lligades al scroll (spec 002) | Versió castellana (`/es`) |
| Llistat de 21 botigues + mapa interactiu (spec 001) | Gestor de continguts |
| Pàgina de detall per botiga amb horari i «obert ara» | Formulari d'encàrrec de pastissos |
| SEO + GEO complets (spec 003) | |
| Pressupost de rendiment (spec 004) | |

## Principis

- **Contingut com a dades.** Botigues, productes i escenes són dades tipades a
  `src/data`; els components només les pinten.
- **El domini no coneix el framework.** `src/domain` i `src/lib` són TypeScript
  pur, provat amb Vitest, sense React ni Next.
- **Proveïdors a la frontera.** Leaflet i OpenStreetMap només apareixen a
  `src/components/map/leaflet/`. La resta de l'app parla amb `MapView`.
- **Res de rellotge ni atzar amagats.** L'hora entra per paràmetre
  (`isOpenAt(hours, date)`), l'atzar de les animacions surt d'un PRNG amb llavor.

## Metodologia

1. **SDD**: cada funcionalitat comença amb una spec en aquesta carpeta, amb
   criteris d'acceptació numerats (`B-1`, `A-3`…).
2. **TDD**: cada criteri verificable té una prova que el cita pel codi i que
   s'ha vist fallar abans d'implementar-lo.
3. **SOLID**: responsabilitat única per mòdul; les escenes s'estenen afegint un
   model nou sense tocar el motor (`ScrollScene`); els components depenen
   d'interfícies (`StoreRepository`, `MapView`), no d'implementacions.
