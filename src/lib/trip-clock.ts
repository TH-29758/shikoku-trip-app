export const DEPARTURE = Date.parse('2026-09-24T08:00:00+09:00');
export const RETURN = Date.parse('2026-09-29T08:15:00+09:00');
export function getTripClock(now: number) {
  const remaining = Math.max(0, DEPARTURE - now);
  return { phase: now < DEPARTURE ? 'before' : now < RETURN ? 'during' : 'after', days: Math.floor(remaining / 86400000), hours: Math.floor(remaining / 3600000) % 24, minutes: Math.floor(remaining / 60000) % 60 } as const;
}
