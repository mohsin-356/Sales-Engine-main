import { startOfDay, isAfter, isBefore, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay } from 'date-fns';

export type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'custom';

/**
 * Returns a predicate function to test if a date falls within the given timeframe.
 */
export function createDatePredicate(
  timeframe: TimeFrame,
  customStart?: Date | null,
  customEnd?: Date | null,
): (d: Date) => boolean {
  const today = startOfDay(new Date());

  switch (timeframe) {
    case 'daily':
      return (d) => isSameDay(d, today);
    case 'weekly': {
      const start = startOfWeek(today);
      const end = endOfWeek(today);
      return (d) => !isBefore(d, start) && !isAfter(d, end);
    }
    case 'monthly': {
      const start = startOfMonth(today);
      const end = endOfMonth(today);
      return (d) => !isBefore(d, start) && !isAfter(d, end);
    }
    case 'custom': {
      if (!customStart || !customEnd) return () => true;
      return (d) => !isBefore(d, customStart) && !isAfter(d, customEnd);
    }
    default:
      return () => true;
  }
}
