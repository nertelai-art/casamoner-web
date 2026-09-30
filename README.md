# casamoner · web

Nova web de [casamoner](https://www.casamoner.com), fleca i pastisseria ecològica
de Girona. Next.js 16 + React 19 + TypeScript, desplegada a Vercel.

## Què hi ha

- **Portada** amb pans, pastissos, dolços, salats, càtering, obrador, botigues i
  preguntes freqüents.
- **Quatre escenes lligades al scroll** ([spec 002](docs/specs/002-animacions.md),
  [spec 005](docs/specs/005-croissant-cafe.md)):
  - *Cafeteria* (fotos reals, vista zenital): un croissant cau sobre el plat,
    apareix la tassa, s'omple de cafè, en surt vapor i el croissant queda
    mossegat. Fotos d'Unsplash; el croissant és provisional
    ([crèdits](docs/CREDITS.md)).
  - *Pans* (fotos de l'obrador): les mans pasten la massa, s'obre la porta del
    forn cap a les barres a les safates i en surt el Pa de pagès fumejant.
  - *Pastissos*: el pastís de formatge entra caminant a trompicons dins la seva
    pròpia foto, de la qual s'ha esborrat.
  - *Dolços*: el panettone de Nadal es munta peça a peça (retalls amb fons
    transparent) sobre el fons de la pàgina.
- **21 botigues** amb mapa interactiu, filtre per població, «obert ara» i una
  fitxa estàtica per botiga amb horari, telèfon i com arribar-hi.
- **SEO i GEO**: JSON-LD (`Organization`, `Bakery`, `FAQPage`,
  `BreadcrumbList`), sitemap, robots que admet els rastrejadors d'IA i
  [`/llms.txt`](src/app/llms.txt/route.ts) generat de les mateixes dades.

## Com es treballa

La metodologia és a [docs/specs/000-visio.md](docs/specs/000-visio.md): cada
funcionalitat té una spec amb criteris numerats, i cada criteri una prova.

```bash
pnpm install --frozen-lockfile
```

```bash
pnpm dev
```

```bash
pnpm check
```

| Script | Què fa |
| --- | --- |
| `pnpm dev` | Servidor de desenvolupament (amb Webpack, vegeu més avall). |
| `pnpm check` | Typecheck + lint (inclou les fronteres d'imports) + tests. |
| `pnpm build` | Build de producció (Turbopack; és la que fa Vercel). |
| `pnpm build:local` | Build de producció amb Webpack, per a aquesta màquina. |
| `pnpm images` | Redimensiona les fotos originals d'`assets-src/` a `public/images/`. |
| `pnpm bakery` | Genera les capes de l'escena del pa (`src/data/scenes/bakery.json`). |
| `pnpm breakfast` | Genera les capes de l'escena de la cafeteria (`src/data/scenes/breakfast.json`). |
| `pnpm scenes` | Genera les capes de les escenes (pastís sense fons, retalls del panettone) a `public/images/scenes/` i `src/data/scenes/layers.json`. |

El hook de **pre-push** (`.githooks/pre-push`, s'activa sol amb `pnpm install`)
passa typecheck, lint, tests i `gitleaks` si és instal·lat. La CI només fa la build.

### Per què `--webpack` en local

En aquesta màquina, el Control d'aplicacions de Windows bloqueja el binari natiu
de SWC (`next-swc.win32-x64-msvc.node`). Next cau a la versió WebAssembly, que no
funciona amb Turbopack. A Vercel (Linux) no passa, i allà es compila amb Turbopack.

## Estructura

```
src/
  domain/        Regles de negoci pures: horaris, distàncies, filtres (sense React)
  data/          Contingut tipat: botigues, catàleg, dades del lloc
  lib/motion/    Primitives d'animació: timeline, PRNG amb llavor, progrés de scroll
  lib/scenes/    Models purs de les escenes: progrés → estat de cada peça
  lib/image/     Clau de color per retallar fotos de fons blanc (s'usa en compilar)
  lib/seo/       Constructors de JSON-LD i de llms.txt
  components/
    scenes/      Motor ScrollScene + vistes de les escenes (totes amb fotos reals)
    map/         Port MapView; l'adaptador Leaflet és l'únic que coneix el proveïdor
    stores/      Cercador de botigues i estat «obert ara»
    sections/    Seccions de la portada
  app/           Rutes de Next
docs/specs/      Especificacions (SDD)
```

## Pendent de validar amb el client

Vegeu [docs/specs/001-botigues.md](docs/specs/001-botigues.md#dades-a-validar-amb-el-client):
coordenades aproximades de sis botigues, un telèfon duplicat i el tractament
dels festius.

## Per a producció

- Les tessel·les del mapa són d'OpenStreetMap, amb atribució. Per a trànsit alt,
  la seva política demana un proveïdor propi (MapTiler, Stadia…): només cal
  canviar `TILE_URL` a `src/components/map/leaflet/LeafletMap.tsx`.
- `NEXT_PUBLIC_SITE_URL` fixa el domini canònic (per defecte `https://www.casamoner.com`).
