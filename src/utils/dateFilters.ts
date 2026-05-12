import { Expense } from "../types/models";

/**
 * Returns the start and end dates (ISO) for a given year/month.
 * Month is 0-indexed (0 = January, 11 = December).
 */
export const getMonthRange = (year: number, month: number) => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

/**
 * Filters expenses to a specific month/year.
 * Month is 0-indexed (0 = January).
 */
export const filterExpensesByMonth = (
  expenses: Expense[],
  year: number,
  month: number
): Expense[] => {
  const { start, end } = getMonthRange(year, month);
  return expenses.filter((e) => {
    const d = new Date(e.date);
    return d >= start && d <= end;
  });
};

/**
 * Shorthand to filter expenses to the current calendar month.
 */
export const filterCurrentMonthExpenses = (expenses: Expense[]): Expense[] => {
  const now = new Date();
  return filterExpensesByMonth(expenses, now.getFullYear(), now.getMonth());
};

/**
 * Returns a sorted list of { year, month, label } for all months
 * that have at least one expense, most recent first.
 */
export const getAvailableMonths = (
  expenses: Expense[]
): { year: number; month: number; label: string }[] => {
  const seen = new Set<string>();
  const months: { year: number; month: number; label: string }[] = [];

  for (const e of expenses) {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!seen.has(key)) {
      seen.add(key);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      });
    }
  }

  // Sort descending (most recent first)
  months.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  return months;
};

/**
 * Returns the label for a given month/year, e.g. "May 2026".
 */
export const getMonthLabel = (year: number, month: number): string => {
  const d = new Date(year, month, 1);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};
