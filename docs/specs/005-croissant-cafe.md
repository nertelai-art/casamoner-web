# 005 · Escena del croissant i el cafè (sota el hero)

> **v2 (30/09/2026):** el client vol que es vegi **real**, no 3D. L'escena es
> fa amb **fotos reals retallades** (vista zenital) en lloc de models three.js.
> Fotos: `docs/CREDITS.md` (Unsplash; el croissant és provisional fins que el
> client en tingui una de seva). Capes generades amb `pnpm breakfast`.

> **v3 (01/10/2026):** l'esmorzar se serveix sobre la **safata verd oliva
> apagat** de les cafeteries casamoner, i s'hi afegeixen un **entrepà** i un
> **suc de taronja**. El croissant, el cafè i la mossegada final no canvien.
> Els textos passen a tenir intenció («Per tenir un bon dia, vine a casamoner»).

> **v4 (01/10/2026):** l'entrepà es retalla de la foto i cau al plat com el
> croissant (abans era la foto sencera del plat i es notava). A cada plat hi ha
> un **tovalló marró molt clar amb el logotip** de casamoner. El text ja no
> descriu el que es veu (fora la llista de passos) i no promet servei a taula:
> a casamoner la safata l'agafa el client.

Escena guiada pel scroll, just després del hero, vista des de dalt.

1. **Safata**: entra la safata verd oliva; tot el que ve després s'hi posa a sobre.
2. **Plat**: un plat de ceràmica entra i s'assenta.
3. **Croissant**: baixa girant i es col·loca sobre el plat.
4. **Tassa**: apareix la tassa amb el plat petit i s'omple de cafè.
5. **Vapor**: puja vapor de la tassa.
6. **Entrepà**: arriba un segon plat amb el tovalló, i l'entrepà hi cau a sobre.
7. **Suc**: arriba el got de suc de taronja.
8. **Mossegada**: al croissant li falta un tros (marca de dents i interior
   fullat real a la vora), el tros arrencat s'aixeca i desapareix, i cauen molles
   reals.

## Criteris

- **K-1** Les fases van en aquest ordre i no se solapen de manera que una
  peça aparegui abans que l'anterior s'hagi assentat: plat → croissant → tassa
  → cafè → vapor → mossegada.
- **K-2** Al progrés 0 no es veu res; al progrés 1 hi ha la safata amb plat,
  croissant mossegat, tassa plena, vapor, entrepà i suc.
- **K-3** El nivell de cafè creix de manera monòtona de 0 a 1.
- **K-4** La mossegada és de tot o res en un instant curt (un mos, no una
  erosió lenta), i les molles cauen després.
- **K-5** Tot són fotos reals: cap model 3D. Amb moviment reduït es veu l'estat final.
- **K-7** Les ombres tenen la forma de l'objecte i s'allunyen i difuminen quan
  l'objecte és a l'aire (caiguda creïble en vista zenital).
- **K-8** La safata és el primer que arriba i ha d'estar assentada abans que
  hi caigui el plat. L'entrepà i el suc arriben, en aquest ordre, després del
  cafè i abans de la mossegada, que continua sent el final.
- **K-9** El plat de l'entrepà (amb el tovalló) s'ha assentat abans que l'entrepà
  comenci a caure; l'entrepà és a l'aire mentre cau i reposa al final.
- **K-10** El text de la secció té intenció i no enumera el que es veu a la
  imatge; no parla de servei a taula.
- **K-6** El text de la secció (títol, passos) és HTML real; el canvas porta
  `aria-hidden`.
