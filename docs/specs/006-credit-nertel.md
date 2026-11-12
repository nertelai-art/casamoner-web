# 006 · Crèdit «Web feta per Nertel»

Una franja pròpia **sota** el peu, discreta i centrada, que diu qui ha fet la
web i porta a nertel.ai. El mateix format a totes les webs de clients de Nertel.

## Criteris

- **N-1** L'enllaç porta a `https://nertel.ai/<idioma>` en l'idioma de la
  pàgina (`ca`). Si algun dia la web té un idioma que nertel.ai no té (nertel.ai
  té `ca es en fr it de`), porta a `/en`.
- **N-2** L'enllaç marca d'on ve la visita: `utm_source=<host de la web>` (sense
  protocol ni `www.`) i `utm_medium=credit`. Mentre la web no serveixi al seu
  domini, el host és `casamoner-web.vercel.app`; quan passi a
  `www.casamoner.com`, es canvia a `casamoner.com`.
- **N-3** Tota la franja és un sol enllaç amb el text «Web feta per Nertel», que
  s'obre en una pestanya nova (`target="_blank" rel="noopener"`). Res de
  `nofollow` ni de paraules clau. El símbol de Nertel porta `alt=""`.
- **N-4** Colors adaptats al peu fosc: la franja és una mica més fosca que el
  peu, amb una vora superior subtil; el símbol s'aclareix
  (`filter: brightness(2.2) saturate(1.2)`) i «Nertel» va en blanc.
