import { ALL_DAYS, type IsoWeekday, type OpeningHours } from './store';

export const STORE_TIME_ZONE = 'Europe/Madrid';

export const DAY_NAMES: Record<IsoWeekday, string> = {
  1: 'Dilluns',
  2: 'Dimarts',
  3: 'Dimecres',
  4: 'Dijous',
  5: 'Divendres',
  6: 'Dissabte',
  7: 'Diumenge',
};

const WEEKDAY_INDEX: Record<string, IsoWeekday> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: STORE_TIME_ZONE,
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** Dia i minut del dia a Madrid per a un instant donat. */
export function localMoment(date: Date): { weekday: IsoWeekday; minutes: number } {
  const parts = Object.fromEntries(partsFormatter.formatToParts(date).map((p) => [p.type, p.value]));
  const weekday = WEEKDAY_INDEX[parts.weekday ?? ''];
  if (!weekday) throw new Error(`Dia no reconegut: ${parts.weekday}`);
  return { weekday, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

export const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/** «07:45» → «7:45». */
export const formatTime = (time: string): string => time.replace(/^0(\d)/, '$1');

const slotsFor = (hours: OpeningHours, day: IsoWeekday) =>
  hours.filter((slot) => slot.days.includes(day)).sort((a, b) => toMinutes(a.opens) - toMinutes(b.opens));

export function isOpenAt(hours: OpeningHours, date: Date): boolean {
  const { weekday, minutes } = localMoment(date);
  return slotsFor(hours, weekday).some((s) => minutes >= toMinutes(s.opens) && minutes < toMinutes(s.closes));
}

export interface Change {
  kind: 'opens' | 'closes';
  time: string;
  weekday: IsoWeekday;
  daysAhead: number;
}

const addDays = (day: IsoWeekday, n: number) => ((((day - 1 + n) % 7) + 7) % 7) + 1 as IsoWeekday;

export function nextChange(hours: OpeningHours, date: Date): Change | null {
  const { weekday, minutes } = localMoment(date);
  const current = slotsFor(hours, weekday).find(
    (s) => minutes >= toMinutes(s.opens) && minutes < toMinutes(s.closes),
  );
  if (current) return { kind: 'closes', time: current.closes, weekday, daysAhead: 0 };

  for (let ahead = 0; ahead <= 7; ahead++) {
    const day = addDays(weekday, ahead);
    const slot = slotsFor(hours, day).find((s) => ahead > 0 || toMinutes(s.opens) > minutes);
    if (slot) return { kind: 'opens', time: slot.opens, weekday: day, daysAhead: ahead };
  }
  return null;
}

export interface StoreStatus {
  open: boolean;
  label: string;
}

export function describeStatus(hours: OpeningHours, date: Date): StoreStatus {
  const change = nextChange(hours, date);
  if (!change) return { open: false, label: 'Tancat' };
  const time = formatTime(change.time);
  if (change.kind === 'closes') return { open: true, label: `Obert · tanca a les ${time}` };
  const when =
    change.daysAhead === 0 ? '' : change.daysAhead === 1 ? 'demà ' : `${DAY_NAMES[change.weekday].toLowerCase()} `;
  return { open: false, label: `Tancat · obre ${when}a les ${time}` };
}

export interface HoursRow {
  days: string;
  hours: string;
}

/** Agrupa dies consecutius amb la mateixa franja per mostrar-los (B-7). */
export function groupHours(hours: OpeningHours): HoursRow[] {
  const labelFor = (day: IsoWeekday) => {
    const slots = slotsFor(hours, day);
    return slots.length
      ? slots.map((s) => `${formatTime(s.opens)} – ${formatTime(s.closes)}`).join(' · ')
      : 'Tancat';
  };

  const groups: { from: IsoWeekday; to: IsoWeekday; hours: string }[] = [];
  for (const day of ALL_DAYS) {
    const label = labelFor(day);
    const last = groups.at(-1);
    if (last && last.hours === label) last.to = day;
    else groups.push({ from: day, to: day, hours: label });
  }

  return groups.map(({ from, to, hours: label }) => ({
    days:
      from === 1 && to === 7 ? 'Cada dia' : from === to ? DAY_NAMES[from] : `${DAY_NAMES[from]} – ${DAY_NAMES[to]}`,
    hours: label,
  }));
}
