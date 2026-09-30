export interface Product {
  readonly name: string;
  readonly image: string;
  readonly description?: string;
}

export const breads = [
  {
    name: 'Pa Etiqueta Negra',
    image: '/images/general/pa-molla.jpg',
    description:
      'Massa mare, farines ecològiques, aigua purificada i vivificada i sal marina sense refinar. Fermentació lenta.',
  },
  {
    name: 'Pa Etiqueta Blanca',
    image: '/images/general/obrador-portada.jpg',
    description:
      'Massa mare i llevat París, farines de la terra, aigua purificada i vivificada i sal marina sense refinar.',
  },
] as const satisfies readonly Product[];

export const cakes = [
  { name: 'Formatge i macadàmia', image: '/images/pastissos/formatge-macadamia.jpg' },
  { name: 'Red velvet', image: '/images/pastissos/red-velvet.jpg' },
  { name: 'Rovell i trufa', image: '/images/pastissos/iema-trufa.jpg' },
  { name: 'Mousse de dues textures', image: '/images/pastissos/mousse-dues-textures.jpg' },
  { name: 'Xocolata i nous', image: '/images/pastissos/xocolata-nous.jpg' },
  { name: 'Sacher', image: '/images/pastissos/sacher.jpg' },
  { name: 'Sara', image: '/images/pastissos/sara.jpg' },
  { name: 'Pastanaga', image: '/images/pastissos/pastanaga.jpg' },
  { name: 'Tres xocolates', image: '/images/pastissos/tres-xocolates.jpg' },
  { name: 'Crocant', image: '/images/pastissos/crocanti.jpg' },
  { name: 'Fruites', image: '/images/pastissos/fruites.jpg' },
  { name: 'Massini', image: '/images/pastissos/massini.jpg' },
] as const satisfies readonly Product[];

export const sweets = [
  { name: 'Magdalenes de kamut o espelta', image: '/images/dolcos/magdalenes.jpg' },
  { name: 'Croissants de mantega', image: '/images/dolcos/croissants.jpg', description: "De l'obrador a les botigues, cada dia." },
  { name: 'Minixuixos', image: '/images/dolcos/minixuixos.jpg' },
  { name: 'Galetes ecològiques', image: '/images/dolcos/galetes.jpg' },
  { name: 'Cremositats', image: '/images/dolcos/cremositats.jpg' },
  { name: 'Cassoletes de fruita', image: '/images/general/cassoletes.jpg' },
] as const satisfies readonly Product[];

export const savories = [
  { name: 'Quiche de bolets', image: '/images/salats/quiche-bolets.jpg' },
  { name: 'Quiche de formatge i pernil', image: '/images/salats/quiche-formatge-pernil.jpg' },
  { name: 'Quiche de roquefort i cherry', image: '/images/salats/quiche-roquefort-cherry.jpg' },
  { name: 'Quiche d’espinacs i roquefort', image: '/images/salats/quiche-espinacs-roquefort.jpg' },
  { name: 'Quiche de verdures', image: '/images/salats/quiche-verdures.jpg' },
  { name: 'Quiche de porros i carbassó', image: '/images/salats/quiche-porros-carbasso.jpg' },
  { name: 'Coca de recapte de verdures', image: '/images/salats/coca-verdures.jpg' },
  { name: 'Coca de recapte de carbassó', image: '/images/salats/coca-carbasso.jpg' },
  { name: 'Coca de recapte de rossinyols', image: '/images/salats/coca-rossinyols.jpg' },
  { name: 'Coca de recapte de tomàquet', image: '/images/salats/coca-tomaquet.jpg' },
] as const satisfies readonly Product[];

export interface Faq {
  readonly question: string;
  readonly answer: string;
}

export const faqs: readonly Faq[] = [
  {
    question: 'Quines farines feu servir?',
    answer:
      'Tots els nostres productes de fleca i pastisseria estan elaborats amb farines ecològiques, lliures de pesticides i glifosat. En alguns productes fem servir kamut i espelta.',
  },
  {
    question: 'Quina diferència hi ha entre el pa Etiqueta Negra i l’Etiqueta Blanca?',
    answer:
      "L'Etiqueta Negra es fa només amb massa mare i farines ecològiques. L'Etiqueta Blanca combina massa mare i llevat París amb farines de la terra. Tots dos porten aigua purificada i vivificada i sal marina sense refinar.",
  },
  {
    question: 'Puc encarregar un pastís personalitzat?',
    answer:
      'Sí. Fem pastissos personalitzats per a qualsevol celebració. Encarregueu-lo a qualsevol de les nostres botigues.',
  },
  {
    question: 'Feu càtering?',
    answer:
      "Sí, per a particulars, empreses i celebracions. Escriviu a catering@casamoner.com o descarregueu-vos el catàleg des d'aquesta pàgina.",
  },
  {
    question: 'Quantes botigues teniu i on són?',
    answer:
      "Tenim 21 botigues: 10 a Girona ciutat i la resta a Banyoles, Torroella de Montgrí, La Bisbal d'Empordà, Vulpellac, Palafrugell, Palamós, Platja d'Aro, S'Agaró, Sant Feliu de Guíxols i Blanes. Algunes són dins d'Ametller Origen.",
  },
  {
    question: 'Obriu els diumenges?',
    answer:
      'La majoria de botigues obren cada dia, festius inclosos. Algunes fan horari reduït els diumenges; consulteu la fitxa de cada botiga.',
  },
];
