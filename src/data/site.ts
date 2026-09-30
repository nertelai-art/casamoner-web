export const site = {
  name: 'casamoner',
  legalName: 'casamoner',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.casamoner.com',
  locale: 'ca_ES',
  tagline: 'Fleca i pastisseria ecològica a Girona',
  description:
    "Fleca i pastisseria de Girona amb 21 botigues. Pa de massa mare i farines ecològiques lliures de pesticides i glifosat, pastissos per encàrrec, dolços, salats i càtering.",
  email: 'hola@casamoner.com',
  cateringEmail: 'catering@casamoner.com',
  jobsEmail: 'casamoner@casamoner.com',
  cateringCatalog: 'https://www.casamoner.com/uploaded/filelinks/link_catering/1cataleg_catering_2025_compressed_v3.pdf',
  social: {
    instagram: 'https://www.instagram.com/casamonergirona',
    facebook: 'https://www.facebook.com/casamoner',
    x: 'https://x.com/Casamoner',
  },
  ogImage: '/images/general/hero-aparador-pans.jpg',
} as const;

export type Site = typeof site;

export const absoluteUrl = (path: string): string => new URL(path, site.url).toString();
