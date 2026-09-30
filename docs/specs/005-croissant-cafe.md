# 005 · Escena del croissant i el cafè (sota el hero) — 3D

Escena modelada per codi (three.js), guiada pel scroll, just després del hero.

1. **Plat**: un plat de ceràmica entra i s'assenta.
2. **Croissant**: baixa girant i es col·loca sobre el plat.
3. **Tassa**: apareix la tassa amb el plat petit i s'omple de cafè.
4. **Vapor**: puja vapor de la tassa.
5. **Mossegada**: al croissant li falta un tros (queda la marca de la
   mossegada, amb l'interior esponjós visible) i cauen quatre molles.

## Criteris

- **K-1** Les fases van en aquest ordre i no se solapen de manera que una
  peça aparegui abans que l'anterior s'hagi assentat: plat → croissant → tassa
  → cafè → vapor → mossegada.
- **K-2** Al progrés 0 no es veu res; al progrés 1 hi ha plat, croissant
  mossegat, tassa plena i vapor.
- **K-3** El nivell de cafè creix de manera monòtona de 0 a 1.
- **K-4** La mossegada és de tot o res en un instant curt (un mos, no una
  erosió lenta), i les molles cauen després.
- **K-5** Sense WebGL: una foto real de croissants del client.
- **K-6** El text de la secció (títol, passos) és HTML real; el canvas porta
  `aria-hidden`.
