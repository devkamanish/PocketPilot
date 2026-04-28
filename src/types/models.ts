export type ExpenseCategory =
  | "food"
  | "transport"
  | "shopping"
  | "bills"
  | "health"
  | "entertainment"
  | "other"
  | (string & {});

export type Expense = {
  id: string;
  user_id: string;
  amount: number;
  category: ExpenseCategory;
  note: string;
  date: string;
  created_at?: string;
  updated_at?: string;
  synced?: boolean;
};

export type Budget = {
  id: string;
  user_id: string;
  category: ExpenseCategory;
  limit: number;
};

export type Subscription = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  renewal_date: string;
  billing_cycle: "monthly" | "yearly";
};

export type UserProfile = {
  user_id?: string;
  income: number;
  savingsGoal: number;
  categoryAllocations?: Record<string, number>;
  avatarUrl?: string;
};

export type Insight = {
  id: string;
  message: string;
  severity: "info" | "warning";
};

export type OfflineAction =
  | { type: "CREATE_EXPENSE"; payload: Omit<Expense, "id"> & { id?: string } }
  | { type: "UPDATE_EXPENSE"; payload: { id: string; data: Partial<Expense> } }
  | { type: "DELETE_EXPENSE"; payload: { id: string } };
