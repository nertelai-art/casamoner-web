import { groupHours } from '@/domain/opening-hours';
import type { Store } from '@/domain/store';

interface LlmsInput {
  site: { name: string; url: string; description: string };
  stores: readonly Store[];
  facts: readonly string[];
}

/**
 * Genera /llms.txt (https://llmstxt.org): un resum en Markdown pensat perquè
 * els assistents d'IA citin dades correctes (GEO). Surt de les mateixes dades
 * que la web, així no es pot desincronitzar.
 */
export function buildLlmsTxt({ site, stores, facts }: LlmsInput): string {
  const link = (path: string) => new URL(path, site.url).toString();

  const storeLines = stores.map((s) => {
    const hours = groupHours(s.hours)
      .map((row) => `${row.days} ${row.hours}`)
      .join('; ');
    const parts = [
      `${s.address.street}, ${s.address.postalCode} ${s.address.locality}`,
      s.phone ? `Tel. ${s.phone}` : null,
      hours,
      s.ametllerOrigen ? 'dins d’Ametller Origen' : null,
    ].filter(Boolean);
    return `- [${s.name}](${link(`/botigues/${s.slug}`)}): ${parts.join(' · ')}`;
  });

  return [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    '## Fets clau',
    '',
    ...facts.map((f) => `- ${f}`),
    '',
    '## Pàgines',
    '',
    `- [Inici](${link('/')}): pans, pastissos, dolços, salats, càtering i preguntes freqüents`,
    `- [Botigues](${link('/botigues')}): mapa i llistat de totes les botigues`,
    '',
    `## Botigues (${stores.length})`,
    '',
    ...storeLines,
    '',
  ].join('\n');
}
