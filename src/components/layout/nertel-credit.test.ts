import { nertelCreditUrl } from './nertel-credit';

// La franja «Web feta per Nertel» porta a nertel.ai en l'idioma de la pàgina, i marca d'on ve la
// visita perquè a l'analítica de nertel.ai es vegi quines webs de clients ens envien gent.
describe('Nertel credit link (spec 006)', () => {
  it('N-1 goes to nertel.ai in the language of the page', () => {
    expect(new URL(nertelCreditUrl('ca')).pathname).toBe('/ca');
    expect(new URL(nertelCreditUrl('es')).pathname).toBe('/es');
    expect(new URL(nertelCreditUrl('ca')).origin).toBe('https://nertel.ai');
  });

  it('N-1 defaults to Catalan, the only language of the site', () => {
    expect(new URL(nertelCreditUrl()).pathname).toBe('/ca');
  });

  it('N-1 falls back to English for a language nertel.ai does not have', () => {
    expect(new URL(nertelCreditUrl('nl')).pathname).toBe('/en');
  });

  it('N-2 says the visit comes from the credit in the casamoner footer', () => {
    const params = new URL(nertelCreditUrl()).searchParams;
    expect(params.get('utm_source')).toBe('casamoner-web.vercel.app');
    expect(params.get('utm_medium')).toBe('credit');
  });
});
