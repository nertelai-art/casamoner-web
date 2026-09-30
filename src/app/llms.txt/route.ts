import { site } from '@/data/site';
import { storeRepository } from '@/data/stores';
import { buildLlmsTxt } from '@/lib/seo/llms';

export const dynamic = 'force-static';

export function GET() {
  const body = buildLlmsTxt({
    site,
    stores: storeRepository.all(),
    facts: [
      'Fleca i pastisseria de Girona amb 21 botigues a les comarques gironines.',
      'Tots els productes de fleca i pastisseria es fan amb farines ecològiques, lliures de pesticides i glifosat.',
      'Pa Etiqueta Negra: massa mare, farines ecològiques, aigua purificada i vivificada i sal marina sense refinar.',
      'Pa Etiqueta Blanca: massa mare i llevat París, farines de la terra, aigua purificada i vivificada i sal marina sense refinar.',
      'Pastissos personalitzats per encàrrec a qualsevol botiga.',
      'Quiches (base de kamut integral ecològic) i coques de recapte per encàrrec.',
      `Càtering per a particulars, empreses i celebracions: ${site.cateringEmail}.`,
      `Contacte general: ${site.email}.`,
    ],
  });
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
