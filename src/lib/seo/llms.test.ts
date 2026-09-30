import { storeRepository } from '@/data/stores';
import { buildLlmsTxt } from './llms';

describe('llms.txt (S-6)', () => {
  const text = buildLlmsTxt({
    site: { name: 'casamoner', url: 'https://www.casamoner.com', description: 'Fleca ecològica.' },
    stores: storeRepository.all(),
    facts: ['Farines ecològiques'],
  });

  it('starts with an H1 and a blockquote summary, per the llms.txt convention', () => {
    const [h1, , quote] = text.split('\n');
    expect(h1).toBe('# casamoner');
    expect(quote).toBe('> Fleca ecològica.');
  });

  it('lists every store with its page, address, phone and hours', () => {
    for (const store of storeRepository.all()) {
      expect(text).toContain(`[${store.name}](https://www.casamoner.com/botigues/${store.slug})`);
      expect(text).toContain(store.address.street);
    }
    expect(text).toContain('Tel. 972 427 343');
    expect(text).toContain('Cada dia 7:45 – 20:30');
  });
});
