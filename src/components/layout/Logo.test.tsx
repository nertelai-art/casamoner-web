import { render } from '@testing-library/react';
import { Branded } from './Logo';

describe('Branded', () => {
  it('writes every «casamoner» as the wordmark and keeps the sentence readable', () => {
    const { container } = render(
      <p>
        <Branded>A casamoner fem pa. Vine a casamoner.</Branded>
      </p>,
    );
    expect(container.textContent).toBe('A casamoner fem pa. Vine a casamoner.');
    const marks = [...container.querySelectorAll('p > span')];
    expect(marks).toHaveLength(2);
    expect(marks.map((m) => [...m.children].map((c) => c.textContent))).toEqual([
      ['casa', 'moner'],
      ['casa', 'moner'],
    ]);
  });

  it('leaves text without the brand untouched', () => {
    const { container } = render(
      <p>
        <Branded>Pa de massa mare</Branded>
      </p>,
    );
    expect(container.querySelector('span')).toBeNull();
  });
});
