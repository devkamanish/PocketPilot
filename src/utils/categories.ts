import { Budget } from "../types/models";

export const BASE_CATEGORIES = ["food", "shopping", "other"];

export const getAllCategories = (budgets: Budget[]): string[] => {
  const dynamicCategories = budgets.map((b) => b.category);
  return Array.from(new Set([...BASE_CATEGORIES, ...dynamicCategories]));
};
