import type { Faq } from '@/data/catalog';
import type { IsoWeekday, OpeningHours, Store } from '@/domain/store';

/** El mínim del lloc que necessiten els constructors: no depenen de `data/site`. */
export interface SiteInfo {
  name: string;
  url: string;
  description: string;
  email: string;
  social: Record<string, string>;
  logo: string;
}

const CONTEXT = 'https://schema.org';
const SCHEMA_DAYS: Record<IsoWeekday, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
};

const abs = (site: Pick<SiteInfo, 'url'>, path: string) => new URL(path, site.url).toString();
const orgId = (site: Pick<SiteInfo, 'url'>) => abs(site, '/#organitzacio');

/** «972 427 343» → «+34972427343». */
export const toE164 = (phone: string) => `+34${phone.replace(/\D/g, '')}`;

export function organizationJsonLd(site: SiteInfo) {
  return {
    '@context': CONTEXT,
    '@type': 'Organization',
    '@id': orgId(site),
    name: site.name,
    url: abs(site, '/'),
    logo: abs(site, site.logo),
    email: site.email,
    description: site.description,
    sameAs: Object.values(site.social),
  };
}

export function websiteJsonLd(site: SiteInfo) {
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    name: site.name,
    url: abs(site, '/'),
    inLanguage: 'ca',
    publisher: { '@id': orgId(site) },
  };
}

export function openingHoursSpecification(hours: OpeningHours) {
  return hours.map((slot) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: slot.days.map((d) => `${CONTEXT}/${SCHEMA_DAYS[d]}`),
    opens: slot.opens,
    closes: slot.closes,
  }));
}

export function bakeryJsonLd(store: Store, site: SiteInfo) {
  const url = abs(site, `/botigues/${store.slug}`);
  return {
    '@context': CONTEXT,
    '@type': 'Bakery',
    '@id': `${url}#botiga`,
    name: `${site.name} ${store.name}`,
    url,
    image: abs(site, store.image),
    ...(store.phone ? { telephone: toE164(store.phone) } : {}),
    priceRange: '€',
    servesCuisine: 'Fleca i pastisseria ecològica',
    address: {
      '@type': 'PostalAddress',
      streetAddress: store.address.street,
      postalCode: store.address.postalCode,
      addressLocality: store.address.locality,
      addressRegion: 'Girona',
      addressCountry: 'ES',
    },
    geo: { '@type': 'GeoCoordinates', latitude: store.coords.lat, longitude: store.coords.lng },
    openingHoursSpecification: openingHoursSpecification(store.hours),
    parentOrganization: { '@id': orgId(site) },
  };
}

export function faqJsonLd(faqs: readonly Faq[]) {
  return {
    '@context': CONTEXT,
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function breadcrumbJsonLd(site: Pick<SiteInfo, 'url'>, items: readonly { name: string; path: string }[]) {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(site, item.path),
    })),
  };
}
