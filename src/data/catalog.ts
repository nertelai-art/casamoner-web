export interface Product {
  readonly name: string;
  readonly image: string;
  readonly description?: string;
}

export interface BreadLabel {
  readonly name: string;
  readonly label: 'negra' | 'blanca';
  readonly image: string;
  readonly imageAlt: string;
  readonly description: string;
  readonly breads: readonly { name: string; image: string; ingredients: readonly string[] }[];
}

// Font: casamoner.com/pans_etiqueta_negra.php i pans_etiqueta_blanca.php (setembre 2026).
export const breadLabels: readonly BreadLabel[] = [
  {
    name: 'Pa Etiqueta Negra',
    label: 'negra',
    image: '/images/pans/kamut.jpg',
    imageAlt: 'Pa de kamut de casamoner tallat sobre una post de fusta',
    description:
      'Elaborat amb massa mare, farines ecològiques, aigua purificada i vivificada i sal marina sense refinar.',
    breads: [
      {
        name: 'Llonguet',
        image: '/images/pans/llonguet.jpg',
        ingredients: ['Farina de blat ecològic', 'Massa mare', 'Llevat ecològic', 'Llet ecològica de la Granja La Selvatana', 'Mantega ecològica', 'Sal marina sense refinar', 'Aigua purificada i vivificada'],
      },
      {
        name: "Flauta d'espelta",
        image: '/images/pans/flauta-espelta.jpg',
        ingredients: ["Farina d'espelta ecològica extracció 60%", "Farina d'espelta ecològica molta a la pedra extracció 80%", 'Massa mare', 'Llevat ecològic', 'Sal marina sense refinar', 'Aigua purificada i vivificada'],
      },
      {
        name: 'Pa de kamut',
        image: '/images/pans/kamut.jpg',
        ingredients: ['Farina de kamut ecològica', 'Massa mare', 'Sal marina sense refinar', 'Aigua purificada i vivificada'],
      },
      {
        name: 'Pa de fajol',
        image: '/images/pans/fajol.jpg',
        ingredients: ['100% farina integral de fajol ecològica', 'Massa mare de fajol', 'Llevat ecològic', 'Sal marina sense refinar', 'Aigua purificada i vivificada'],
      },
      {
        name: 'Pa de blat de moro',
        image: '/images/pans/blat-de-moro.jpg',
        ingredients: ['75% farina de blat de moro ecològica', '25% farina de blat ecològica', 'Massa mare', 'Sal marina sense refinar', 'Aigua purificada i vivificada'],
      },
    ],
  },
  {
    name: 'Pa Etiqueta Blanca',
    label: 'blanca',
    image: '/images/pans/nostalgia.jpg',
    imageAlt: 'Forner de casamoner amb una barra de Pa Nostàlgia a les mans',
    description:
      'Elaborat amb llevat París i massa mare, farines de la terra, sal marina sense refinar i aigua purificada i vivificada.',
    breads: [
      {
        name: 'Pa Nostàlgia',
        image: '/images/pans/nostalgia.jpg',
        ingredients: ['Farina de blat', 'Farina de sègol', 'Massa mare de sègol i llevat París', 'Sal marina sense refinar', 'Aigua purificada i vivificada'],
      },
      {
        name: 'Pa de Tramuntana',
        image: '/images/pans/tramuntana.jpg',
        ingredients: ["Farina de blat dels Aiguamolls de l'Empordà", 'Massa mare', 'Llevat París', 'Sal marina sense refinar', 'Aigua purificada i vivificada'],
      },
      {
        name: 'Pa de pagès',
        image: '/images/pans/pages.jpg',
        ingredients: ['Farina de blat', 'Massa mare', 'Llevat París', 'Sal marina sense refinar', 'Aigua purificada i vivificada', 'Indicació Geogràfica Protegida'],
      },
    ],
  },
];

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
  { name: 'Croissants', image: '/images/dolcos/croissants.jpg', description: "De l'obrador a les botigues, bolleria fresca cada dia." },
  { name: 'Minixuixos', image: '/images/dolcos/minixuixos.jpg' },
  { name: 'Galetes ecològiques', image: '/images/dolcos/galetes.jpg' },
  { name: 'Cremositats', image: '/images/dolcos/cremositats.jpg' },
  { name: 'Cassoletes', image: '/images/general/cassoletes.jpg' },
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
      "L'Etiqueta Negra s'elabora amb massa mare i farines ecològiques (llonguet, flauta d'espelta, pa de kamut, de fajol i de blat de moro). L'Etiqueta Blanca, amb llevat París i massa mare i farines de la terra (Pa Nostàlgia, Pa de Tramuntana i pa de pagès). Tots porten aigua purificada i vivificada i sal marina sense refinar.",
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
