import type { Store } from '@/domain/store';
import { bakeryJsonLd, breadcrumbJsonLd, faqJsonLd, openingHoursSpecification, organizationJsonLd } from './json-ld';

const site = {
  name: 'casamoner',
  url: 'https://www.casamoner.com',
  description: 'Fleca',
  email: 'hola@casamoner.com',
  social: { instagram: 'https://instagram.com/x' },
  logo: '/logo.png',
};

const store: Store = {
  slug: 'santa-clara',
  name: 'Santa Clara',
  address: { street: 'Carrer de Santa Clara, 46', postalCode: '17001', locality: 'Girona' },
  phone: '972 427 343',
  image: '/images/botigues/santa-clara.jpg',
  ametllerOrigen: false,
  coords: { lat: 41.98, lng: 2.82 },
  hours: [
    { days: [1, 2, 3, 4, 5, 6], opens: '07:45', closes: '20:30' },
    { days: [7], opens: '07:45', closes: '15:00' },
  ],
};

describe('json-ld', () => {
  it('S-2 organization links social profiles', () => {
    const org = organizationJsonLd(site);
    expect(org['@type']).toBe('Organization');
    expect(org.sameAs).toEqual(['https://instagram.com/x']);
    expect(org.logo).toBe('https://www.casamoner.com/logo.png');
  });

  it('S-3 derives openingHoursSpecification from the store hours', () => {
    expect(openingHoursSpecification(store.hours)).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'https://schema.org/Monday',
          'https://schema.org/Tuesday',
          'https://schema.org/Wednesday',
          'https://schema.org/Thursday',
          'https://schema.org/Friday',
          'https://schema.org/Saturday',
        ],
        opens: '07:45',
        closes: '20:30',
      },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['https://schema.org/Sunday'], opens: '07:45', closes: '15:00' },
    ]);
  });

  it('S-3 describes a store as a Bakery with address, geo and phone', () => {
    const ld = bakeryJsonLd(store, site);
    expect(ld).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Bakery',
      '@id': 'https://www.casamoner.com/botigues/santa-clara#botiga',
      name: 'casamoner Santa Clara',
      url: 'https://www.casamoner.com/botigues/santa-clara',
      telephone: '+34972427343',
      image: 'https://www.casamoner.com/images/botigues/santa-clara.jpg',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Carrer de Santa Clara, 46',
        postalCode: '17001',
        addressLocality: 'Girona',
        addressRegion: 'Girona',
        addressCountry: 'ES',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 41.98, longitude: 2.82 },
      parentOrganization: { '@id': 'https://www.casamoner.com/#organitzacio' },
    });
  });

  it('S-4 builds a FAQPage', () => {
    const ld = faqJsonLd([{ question: 'Q?', answer: 'A.' }]);
    expect(ld.mainEntity).toEqual([
      { '@type': 'Question', name: 'Q?', acceptedAnswer: { '@type': 'Answer', text: 'A.' } },
    ]);
  });

  it('S-8 builds a BreadcrumbList with absolute URLs', () => {
    const ld = breadcrumbJsonLd(site, [
      { name: 'Inici', path: '/' },
      { name: 'Botigues', path: '/botigues' },
    ]);
    expect(ld.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Inici', item: 'https://www.casamoner.com/' },
      { '@type': 'ListItem', position: 2, name: 'Botigues', item: 'https://www.casamoner.com/botigues' },
    ]);
  });
});
