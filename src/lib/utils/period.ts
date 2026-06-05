import {
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from "date-fns";
import type { DateRangeQuery } from "@/lib/types";

export function resolvePeriodRange(
  query: DateRangeQuery,
  reference = new Date(),
): { start: Date; end: Date } {
  if (query.startDate && query.endDate) {
    return {
      start: startOfDay(parseISO(query.startDate)),
      end: endOfDay(parseISO(query.endDate)),
    };
  }

  switch (query.period) {
    case "week":
      return {
        start: startOfWeek(reference, { weekStartsOn: 1 }),
        end: endOfWeek(reference, { weekStartsOn: 1 }),
      };
    case "month":
      return { start: startOfMonth(reference), end: endOfMonth(reference) };
    case "quarter":
      return {
        start: startOfQuarter(reference),
        end: endOfQuarter(reference),
      };
    case "year":
      return { start: startOfYear(reference), end: endOfYear(reference) };
    case "day":
    default:
      return { start: startOfDay(reference), end: endOfDay(reference) };
  }
}

export function isDateInPeriod(
  dateStr: string,
  query: DateRangeQuery,
): boolean {
  const { start, end } = resolvePeriodRange(query);
  const d = parseISO(dateStr.length <= 10 ? dateStr : dateStr.slice(0, 10));
  return isWithinInterval(d, { start, end });
}

export function filterByDateField<T>(
  rows: T[],
  query: DateRangeQuery,
  getDate: (row: T) => string | undefined | null,
): T[] {
  return rows.filter((row) => {
    const d = getDate(row);
    if (!d) return false;
    return isDateInPeriod(d, query);
  });
}

export function formatMoney(amount: number, currency = "ETB"): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
