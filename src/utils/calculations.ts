import { Budget, Expense, Insight, Subscription, UserProfile } from "../types/models";

export const sumExpenses = (expenses: Expense[]) =>
  expenses.reduce((total, item) => total + item.amount, 0);

export const savingsRatio = (income: number, spend: number) => {
  if (income <= 0) return 0;
  return ((income - spend) / income) * 100;
};

export const categorySpendMap = (expenses: Expense[]) =>
  expenses.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

export const burnRate = (expenses: Expense[], daysElapsed: number) => {
  if (daysElapsed <= 0) return 0;
  return sumExpenses(expenses) / daysElapsed;
};

export const subscriptionBurden = (subscriptions: Subscription[], income: number) => {
  if (income <= 0) return 0;
  const total = subscriptions.reduce((acc, item) => acc + item.amount, 0);
  return (total / income) * 100;
};

export const generateInsights = (
  expenses: Expense[],
  budgets: Budget[],
  profile: UserProfile
): Insight[] => {
  const insights: Insight[] = [];
  const spendByCategory = categorySpendMap(expenses);



  budgets.forEach((budget) => {
    const spent = spendByCategory[budget.category] || 0;
    if (spent > budget.limit) {
      insights.push({
        id: `budget-exceeded-${budget.category}`,
        message: `${budget.category} budget exceeded by ₹${(spent - budget.limit).toFixed(2)}.`,
        severity: "warning",
      });
    }
  });

  const totalSpend = sumExpenses(expenses);
  const today = new Date();
  const daysElapsed = Math.max(today.getDate(), 1);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const projectedMonthlySpend = burnRate(expenses, daysElapsed) * daysInMonth;

  if (savingsRatio(profile.income, totalSpend) < profile.savingsGoal) {
    insights.push({
      id: "savings-goal-risk",
      message: "Savings goal at risk this month based on current spending.",
      severity: "warning",
    });
  }

  if (profile.income > 0 && projectedMonthlySpend > profile.income) {
    insights.push({
      id: "overspend-prediction",
      message: `At the current burn rate, projected monthly spend is ₹${projectedMonthlySpend.toFixed(
        2
      )}, which exceeds income.`,
      severity: "warning",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "healthy-spending",
      message: "Spending pattern looks healthy so far. Keep going.",
      severity: "info",
    });
  }

  return insights;
};
