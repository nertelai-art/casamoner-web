# 005 · Escena del croissant i el cafè (sota el hero)

> **v2 (30/09/2026):** el client vol que es vegi **real**, no 3D. L'escena es
> fa amb **fotos reals retallades** (vista zenital) en lloc de models three.js.
> Fotos: `docs/CREDITS.md` (Unsplash; el croissant és provisional fins que el
> client en tingui una de seva). Capes generades amb `pnpm breakfast`.

Escena guiada pel scroll, just després del hero, vista des de dalt.

1. **Plat**: un plat de ceràmica entra i s'assenta.
2. **Croissant**: baixa girant i es col·loca sobre el plat.
3. **Tassa**: apareix la tassa amb el plat petit i s'omple de cafè.
4. **Vapor**: puja vapor de la tassa.
5. **Mossegada**: al croissant li falta un tros (marca de dents i interior
   fullat real a la vora), el tros arrencat s'aixeca i desapareix, i cauen molles
   reals.

## Criteris

- **K-1** Les fases van en aquest ordre i no se solapen de manera que una
  peça aparegui abans que l'anterior s'hagi assentat: plat → croissant → tassa
  → cafè → vapor → mossegada.
- **K-2** Al progrés 0 no es veu res; al progrés 1 hi ha plat, croissant
  mossegat, tassa plena i vapor.
- **K-3** El nivell de cafè creix de manera monòtona de 0 a 1.
- **K-4** La mossegada és de tot o res en un instant curt (un mos, no una
  erosió lenta), i les molles cauen després.
- **K-5** Tot són fotos reals: cap model 3D. Amb moviment reduït es veu l'estat final.
- **K-7** Les ombres tenen la forma de l'objecte i s'allunyen i difuminen quan
  l'objecte és a l'aire (caiguda creïble en vista zenital).
- **K-6** El text de la secció (títol, passos) és HTML real; el canvas porta
  `aria-hidden`.
