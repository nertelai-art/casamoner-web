# 002 · Escenes animades lligades al scroll

Tres escenes on la foto «cobra vida» mentre l'usuari fa scroll. No són vídeos:
són capes de la mateixa foto retallades (`clip-path`) i mogudes fotograma a
fotograma segons el progrés de scroll (0 → 1). Una sola descàrrega d'imatge per
escena.

## Motor comú

- `ScrollScene` fixa l'escenari (`position: sticky`) dins d'un contenidor alt i
  calcula el progrés 0–1 amb `requestAnimationFrame`, sense re-renderitzar React
  a cada fotograma: cada escena rep `apply(progress)` i escriu estils a refs.
- Cada escena és un **model pur** `frame(progress) → estat de capes` + una
  vista prima. Afegir una escena no toca el motor (obert/tancat).

### Criteris del motor

- **M-1** `segment(p, a, b)` torna el progrés local 0–1 dins l'interval [a, b].
- **M-2** `quantize(p, n)` arrodoneix cap avall a `n` fotogrames (efecte
  cinema antic).
- **M-3** El PRNG amb llavor és determinista: mateixa llavor, mateixa seqüència.
- **M-4** Amb `prefers-reduced-motion: reduce` l'escena es mostra directament al
  fotograma final, sense escenari enganxat ni scroll extra.
- **M-5** Totes les escenes, al progrés 1, deixen cada capa al seu lloc
  (sense translació, rotació ni escala) perquè la foto quedi intacta.

## Escena 1 · Magdalena de cítrics (secció Dolços)

Foto: `dolcos/panettone.jpg`. Ordre narratiu:

1. apareix la magdalena (creix des del centre),
2. cauen les llimones i taronges des de dalt i reboten,
3. cauen els trossets petits de fruita confitada.

- **A-1** Al progrés 0 cap capa de primer pla és visible.
- **A-2** La magdalena és completament visible abans que cap cítric comenci a caure.
- **A-3** Cap trosset petit comença a caure abans que tots els cítrics hagin aterrat.
- **A-4** Al progrés 1 es compleix M-5.

## Escena 2 · Cinema antic (secció Pastissos)

Foto: `pastissos/formatge-macadamia.jpg`. El pastís entra **des de dalt a la
dreta, a trompicons**, dins d'un fotograma de pel·lícula gran, amb gra,
parpelleig, ratllades i to sèpia. En aturar-se recupera el color.

- **F-1** El moviment va a salts: dins d'un mateix fotograma quantitzat la
  posició no canvia.
- **F-2** La posició inicial és a dalt a la dreta (x > 0, y < 0) i la final és 0.
- **F-3** El sèpia és 1 mentre es mou i 0 al final.
- **F-4** El tremolor (jitter) és determinista i s'apaga en aterrar.

## Escena 3 · El pa s'infla i es cou (secció Pans)

Foto: `general/obrador-safates.jpg` (cinc barres sobre safates de forn).

1. Fermentació: les barres, pàl·lides i aixafades, s'inflen (escala vertical
   des de la base de la safata).
2. Forn: resplendor taronja, onada de calor, la crosta es daura.
3. Fora del forn: vapor que puja.

Un indicador mostra hores de fermentació (0 → 24 h) i temperatura (20 → 240 °C).

- **P-1** Al progrés 0 les barres són a escala vertical ≤ 0.6 i pàl·lides
  (saturació < 1).
- **P-2** Les barres pugen de manera esglaonada (de dalt a baix), no alhora.
- **P-3** El daurat (saturació) només comença quan la barra ja ha pujat.
- **P-4** L'indicador és monòton creixent.
- **P-5** Al progrés 1 es compleix M-5.
