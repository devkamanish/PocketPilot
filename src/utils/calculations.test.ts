import {
  burnRate,
  generateInsights,
  savingsRatio,
  subscriptionBurden,
  sumExpenses,
} from "./calculations";
import { Budget, Expense, Subscription } from "../types/models";

const expenses: Expense[] = [
  { id: "1", user_id: "u1", amount: 500, category: "food", note: "", date: "2026-04-01" },
  { id: "2", user_id: "u1", amount: 400, category: "bills", note: "", date: "2026-04-02" },
];

const budgets: Budget[] = [{ id: "b1", user_id: "u1", category: "food", limit: 450 }];

const subscriptions: Subscription[] = [
  {
    id: "s1",
    user_id: "u1",
    name: "Netflix",
    amount: 20,
    renewal_date: "2026-05-02",
    billing_cycle: "monthly",
  },
];

describe("financial calculations", () => {
  it("computes spend totals", () => {
    expect(sumExpenses(expenses)).toBe(900);
  });

  it("computes savings ratio", () => {
    expect(savingsRatio(2000, 900)).toBeCloseTo(55, 4);
  });

  it("computes burn rate", () => {
    expect(burnRate(expenses, 10)).toBe(90);
  });

  it("computes subscription burden", () => {
    expect(subscriptionBurden(subscriptions, 2000)).toBe(1);
  });

  it("returns warning insights", () => {
    const insights = generateInsights(expenses, budgets, { income: 1500, savingsGoal: 25 });
    expect(insights.some((i) => i.id === "high-food-spending")).toBeTruthy();
  });
});
