import type { OpeningHours } from './store';
import { describeStatus, groupHours, isOpenAt, nextChange } from './opening-hours';

// Instants en UTC; Madrid és UTC+2 a l'estiu i UTC+1 a l'hivern.
const summer = (iso: string) => new Date(`${iso}+02:00`);
const winter = (iso: string) => new Date(`${iso}+01:00`);

const weekdaysAndSunday: OpeningHours = [
  { days: [1, 2, 3, 4, 5, 6], opens: '07:45', closes: '20:30' },
  { days: [7], opens: '07:45', closes: '15:00' },
];

describe('isOpenAt (B-5)', () => {
  // 2026-09-30 és dimecres; 2026-10-04 és diumenge.
  it('is open inside a slot', () => {
    expect(isOpenAt(weekdaysAndSunday, summer('2026-09-30T12:00:00'))).toBe(true);
  });

  it('is closed before opening and after closing', () => {
    expect(isOpenAt(weekdaysAndSunday, summer('2026-09-30T07:44:00'))).toBe(false);
    expect(isOpenAt(weekdaysAndSunday, summer('2026-09-30T20:30:00'))).toBe(false);
  });

  it('opening is inclusive', () => {
    expect(isOpenAt(weekdaysAndSunday, summer('2026-09-30T07:45:00'))).toBe(true);
  });

  it('uses the slot of the matching weekday', () => {
    expect(isOpenAt(weekdaysAndSunday, summer('2026-10-04T16:00:00'))).toBe(false);
    expect(isOpenAt(weekdaysAndSunday, summer('2026-10-04T14:59:00'))).toBe(true);
  });

  it('converts to Madrid time regardless of the runtime zone (winter time)', () => {
    // 2026-12-02 dimecres, 07:50 a Madrid = 06:50 UTC
    expect(isOpenAt(weekdaysAndSunday, new Date('2026-12-02T06:50:00Z'))).toBe(true);
    expect(isOpenAt(weekdaysAndSunday, winter('2026-12-02T07:40:00'))).toBe(false);
  });
});

describe('nextChange (B-6)', () => {
  it('reports closing time when open', () => {
    expect(nextChange(weekdaysAndSunday, summer('2026-09-30T12:00:00'))).toEqual({
      kind: 'closes',
      time: '20:30',
      weekday: 3,
      daysAhead: 0,
    });
  });

  it('reports the same-day opening when before opening', () => {
    expect(nextChange(weekdaysAndSunday, summer('2026-09-30T06:00:00'))).toMatchObject({
      kind: 'opens',
      time: '07:45',
      daysAhead: 0,
    });
  });

  it('reports the next day opening after closing', () => {
    expect(nextChange(weekdaysAndSunday, summer('2026-09-30T21:00:00'))).toMatchObject({
      kind: 'opens',
      time: '07:45',
      weekday: 4,
      daysAhead: 1,
    });
  });

  it('skips closed days', () => {
    const weekdaysOnly: OpeningHours = [{ days: [1, 2, 3, 4, 5], opens: '09:00', closes: '14:00' }];
    // dissabte 2026-10-03
    expect(nextChange(weekdaysOnly, summer('2026-10-03T10:00:00'))).toMatchObject({
      kind: 'opens',
      weekday: 1,
      daysAhead: 2,
    });
  });

  it('returns null when there are no slots', () => {
    expect(nextChange([], summer('2026-09-30T12:00:00'))).toBeNull();
  });
});

describe('describeStatus', () => {
  it('describes an open store', () => {
    expect(describeStatus(weekdaysAndSunday, summer('2026-09-30T12:00:00'))).toEqual({
      open: true,
      label: 'Obert · tanca a les 20:30',
    });
  });

  it('describes a store that opens later today, tomorrow or another day', () => {
    expect(describeStatus(weekdaysAndSunday, summer('2026-09-30T06:00:00')).label).toBe('Tancat · obre a les 7:45');
    expect(describeStatus(weekdaysAndSunday, summer('2026-09-30T21:00:00')).label).toBe('Tancat · obre demà a les 7:45');
    const weekdaysOnly: OpeningHours = [{ days: [1, 2, 3, 4, 5], opens: '09:00', closes: '14:00' }];
    expect(describeStatus(weekdaysOnly, summer('2026-10-03T10:00:00')).label).toBe('Tancat · obre dilluns a les 9:00');
  });
});

describe('groupHours (B-7)', () => {
  it('groups consecutive days with the same hours', () => {
    expect(groupHours(weekdaysAndSunday)).toEqual([
      { days: 'Dilluns – Dissabte', hours: '7:45 – 20:30' },
      { days: 'Diumenge', hours: '7:45 – 15:00' },
    ]);
  });

  it('collapses a whole week', () => {
    expect(groupHours([{ days: [1, 2, 3, 4, 5, 6, 7], opens: '07:00', closes: '21:00' }])).toEqual([
      { days: 'Cada dia', hours: '7:00 – 21:00' },
    ]);
  });

  it('marks days without slots as closed', () => {
    expect(groupHours([{ days: [1, 2, 3, 4, 5], opens: '09:00', closes: '14:00' }])).toEqual([
      { days: 'Dilluns – Divendres', hours: '9:00 – 14:00' },
      { days: 'Dissabte – Diumenge', hours: 'Tancat' },
    ]);
  });
});
