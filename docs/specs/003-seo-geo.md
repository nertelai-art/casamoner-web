# 003 · SEO i GEO

**SEO**: que Google entengui i posicioni cada pàgina.
**GEO** (*Generative Engine Optimization*): que els assistents d'IA (ChatGPT,
Perplexity, Gemini, Claude…) puguin citar casamoner amb dades correctes.

## Criteris

- **S-1** Cada ruta té `title`, `description`, `canonical`, Open Graph i
  Twitter card propis. `lang="ca"`.
- **S-2** JSON-LD d'`Organization` + `WebSite` a totes les pàgines.
- **S-3** Cada botiga té JSON-LD `Bakery` (subtipus de `LocalBusiness`) amb
  adreça, `geo`, telèfon i `openingHoursSpecification` derivada de les mateixes
  dades de l'horari (una sola font de veritat).
- **S-4** La portada té `FAQPage` amb les preguntes frequents visibles a la pàgina
  (mai contingut que l'usuari no veu).
- **S-5** `sitemap.xml` inclou la portada, `/botigues` i les 21 fitxes;
  `robots.txt` hi apunta i permet els rastrejadors d'IA.
- **S-6** `/llms.txt` resumeix en Markdown qui és casamoner, els productes, i
  llista cada botiga amb adreça, telèfon i horari — generat de les dades.
- **S-7** HTML semàntic: un sol `h1` per pàgina, jerarquia de títols sense
  salts, `alt` descriptius, enllaços amb text significatiu.
- **S-8** Fil d'Ariadna (`BreadcrumbList`) a les pàgines de botiga.
- **S-9** Les dades clau (farines ecològiques, massa mare, lliures de
  glifosat, 21 botigues) apareixen en text pla, no només en imatges.
