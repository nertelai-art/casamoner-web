// Enllaç de la franja «Web feta per Nertel» (spec 006). El mateix format a totes les webs de clients.

// D'on ve la visita, per a l'analítica de nertel.ai: el host de la web, sense protocol ni «www.».
// La web encara no serveix al domini del client: quan passi a www.casamoner.com, canvia-ho a «casamoner.com».
const SOURCE = 'casamoner-web.vercel.app';

// Idiomes que té nertel.ai. Un idioma que no hi sigui porta a la versió anglesa.
const NERTEL_LANGS = ['ca', 'es', 'en', 'fr', 'it', 'de'] as const;

export function nertelCreditUrl(lang = 'ca'): string {
  const path = (NERTEL_LANGS as readonly string[]).includes(lang) ? lang : 'en';
  const url = new URL(`https://nertel.ai/${path}`);
  url.searchParams.set('utm_source', SOURCE);
  url.searchParams.set('utm_medium', 'credit');
  return url.toString();
}
