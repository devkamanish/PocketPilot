import { budgetService } from "../services/budgetService";
import { expenseService } from "../services/expenseService";
import { profileService } from "../services/profileService";
import { subscriptionService } from "../services/subscriptionService";

export const financeApi = {
  expenses: expenseService,
  budgets: budgetService,
  subscriptions: subscriptionService,
  profiles: profileService,
};
