# 001 · Botigues, horaris i mapa

## Dades

Font: web actual (setembre 2026). 21 botigues. Cada botiga té:

- `slug` únic i estable (URL `/botigues/<slug>`).
- nom, adreça (carrer, codi postal, població), telèfon, foto.
- `ametllerOrigen`: si és un córner dins d'un Ametller Origen.
- coordenades (lat, lng).
- horari estructurat: llista de franges `{ days, opens, closes }`, amb dies
  ISO (1 = dilluns … 7 = diumenge) i hores `HH:MM` en hora de Madrid.

### Dades a validar amb el client

- Coordenades de Sant Narcís, Montjuïc, Pericot, S'Agaró, Palau i Vulpellac
  són aproximades (el geocodificador no troba el número exacte).
- Telèfons que la web antiga dona diferents a dos llocs: Montjuïc
  (972 228 991 / 972 447 523). S'usa el del detall de botiga.
- Vulpellac i La Bisbal comparteixen foto genèrica.
- «Festius» s'interpreta com a horari de diumenge; no tenim calendari de festius.

## Criteris d'acceptació

- **B-1** Hi ha exactament 21 botigues i cap `slug` repetit.
- **B-2** Tots els `slug` són minúscules ASCII amb guions (`^[a-z0-9]+(-[a-z0-9]+)*$`).
- **B-3** Totes les coordenades cauen dins la província de Girona
  (lat 41.6–42.5, lng 2.3–3.4).
- **B-4** Cada botiga té horari per als 7 dies de la setmana.
- **B-5** `isOpenAt(hours, date)` diu si és obert en aquell instant, calculant
  l'hora local de `Europe/Madrid` (també en canvi d'hora d'estiu/hivern).
  L'obertura és inclusiva i el tancament exclusiu.
- **B-6** `nextChange(hours, date)` torna quan obrirà o tancarà a continuació,
  per poder dir «Obert · tanca a les 20:30» o «Tancat · obre demà a les 7:45».
- **B-7** L'horari es pot resumir per mostrar-lo agrupant dies consecutius amb
  la mateixa franja: «Dilluns – Dissabte · 7:45 – 20:30».
- **B-8** El repositori permet: llistar-les totes, trobar-ne una per `slug`
  (o `undefined`), i agrupar-les per població.
- **B-9** `/botigues/<slug>` existeix per a cada botiga (generació estàtica) i
  un `slug` desconegut dona 404.
- **B-10** El mapa mostra un marcador per botiga. Clicar un marcador obre una
  targeta amb nom, adreça i estat; l'enllaç «Veure la botiga» navega a
  `/botigues/<slug>`.
- **B-11** El mapa no bloqueja la càrrega: el seu codi i les tessel·les només es
  demanen quan la secció entra a la vista. Sense JavaScript, la llista de
  botigues continua sent navegable.
- **B-12** Des del llistat es pot filtrar per població i veure primer les obertes.
- **B-13** La pàgina de detall mostra horari, telèfon clicable (`tel:`),
  «Com arribar-hi» (Google Maps) i les botigues més properes (per distància).
