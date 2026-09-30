# 002 · Escenes animades lligades al scroll (v2)

> **v2 (30/09/2026)**, després de la revisió del client:
> - *Pans*: fora la foto estirada. El pa es modela en 3D per codi: puja i es cou.
> - *Pastissos*: fora el cinema antic. El pastís entra caminant a trompicons
>   dins la seva pròpia foto, de la qual s'ha esborrat.
> - *Panettone* (abans «magdalena»: a la web actual la foto és el **Panettone
>   de Nadal ecològic**): cada peça és un retall amb fons transparent i es munta
>   directament sobre el fons de la pàgina, sense targeta.
> - Nova escena sota el hero: croissant i cafè (spec 005).

## Motor comú

- `ScrollScene` fixa l'escenari (`sticky`) i passa el progrés 0–1 sense
  re-renderitzar React.
- Cada escena és un **model pur** `frame(progress) → estat` (provat) + una vista.
- Escenes 3D (three.js via `@react-three/fiber`), seguint la guia
  `scroll-3d-scenes`: `frameloop="demand"`, suavitzat amb `damp` i `delta`
  limitat, zero objectes nous per fotograma, il·luminació sense xarxa, codi de
  three.js carregat amb `import()` quan l'escena és a prop.

### Criteris del motor

- **M-1** `segment(p, a, b)` torna el progrés local 0–1 dins [a, b].
- **M-3** El PRNG amb llavor és determinista.
- **M-4** Amb `prefers-reduced-motion` l'escena mostra el fotograma final, sense
  escenari enganxat.
- **M-5** Al progrés 1, cada peça és al seu lloc final.
- **M-6** Sense WebGL, les escenes 3D mostren una foto real equivalent.

## Escena 1 · El pa puja i es cou (Pans) — 3D

Una barra de pa modelada per codi (massa amb tres greixes) sobre una pala de fusta.

1. Fermentació: la massa, pàl·lida i baixa, s'infla.
2. Forn: resplendor càlida; la crosta passa de color massa a daurat torrat i
   les greixes s'obren.
3. Fora del forn: vapor.

- **P-1** Al progrés 0 l'alçada relativa és ≤ 0,55 i el daurat és 0.
- **P-2** L'alçada creix de manera monòtona durant la fermentació i arriba a 1.
- **P-3** El daurat només comença quan la fermentació ha acabat.
- **P-4** Les greixes s'obren a mesura que es dauren.
- **P-5** Al progrés 1: alçada 1, daurat 1, sense resplendor.

No es mostren xifres (hores, graus) que el client no ha donat.

## Escena 2 · El pastís arriba caminant (Pastissos)

Foto: `pastissos/formatge-macadamia.jpg`, separada en dues capes generades en
compilar (`scripts/cake-layers.mjs`): el **fons sense pastís** (la fusta
clonada de just a sobre, on la veta continua) i el **pastís retallat** amb
transparència.

- **C-1** Al principi el pastís és fora del quadre (a la dreta).
- **C-2** Camina a passes: entre passa i passa toca a terra (desplaçament
  vertical 0) i durant la passa s'aixeca i s'inclina.
- **C-3** Ensopega una vegada (inclinació més gran que la d'una passa normal)
  i es refà.
- **C-4** En arribar s'aixafa i rebota (escala Y < 1 i després 1).
- **C-5** Al progrés 1 és exactament al seu lloc de la foto: la foto queda intacta.
- **C-6** L'ombra de sota segueix el pastís i s'encongeix quan salta.

## Escena 3 · Panettone de cítrics (Dolços)

Foto: `dolcos/panettone.jpg`, trossejada en compilar
(`scripts/panettone-layers.mjs`) en retalls amb fons transparent: el
panettone, cada cítric i els trossets de fruita confitada. El fons blanc de la
foto s'elimina (clau de color), així les peces es veuen sobre el fons de la
pàgina, en mode clar i en mode fosc.

1. apareix el panettone,
2. cauen les llimones i taronges i reboten,
3. cauen els trossets petits.

- **A-1** Al progrés 0 cap peça és visible.
- **A-2** El panettone és sencer i quiet abans que caigui cap cítric.
- **A-3** Cap trosset cau abans que tots els cítrics hagin aterrat.
- **A-4** Al progrés 1 totes les peces són al seu lloc (M-5).
- **A-5** No hi ha targeta ni fons: l'escena comparteix el fons de la pàgina.
