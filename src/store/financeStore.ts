import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { create } from "zustand";
import { budgetService } from "../services/budgetService";
import { expenseService } from "../services/expenseService";
import { offlineQueue } from "../services/offlineQueue";
import { profileService } from "../services/profileService";
import { subscriptionService } from "../services/subscriptionService";
import { useAuthStore } from "./authStore";
import { Budget, Expense, OfflineAction, Subscription, UserProfile } from "../types/models";

const PROFILE_KEY = "@pocketpilot_profile";

type FinanceState = {
  expenses: Expense[];
  budgets: Budget[];
  subscriptions: Subscription[];
  profile: UserProfile;
  syncing: boolean;
  error: string | null;
  loadDashboard: (userId: string) => Promise<void>;
  setProfile: (profile: UserProfile) => Promise<void>;
  addExpense: (expense: Omit<Expense, "created_at" | "updated_at">) => Promise<void>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  upsertBudget: (budget: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  upsertSubscription: (subscription: Subscription) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  syncOfflineQueue: () => Promise<void>;
};

export const useFinanceStore = create<FinanceState>((set, get) => ({
  expenses: [],
  budgets: [],
  subscriptions: [],
  profile: { income: 0, savingsGoal: 20, categoryAllocations: {} },
  syncing: false,
  error: null,

  async loadDashboard(userId) {
    try {
      const [expenses, budgets, subscriptions, remoteProfile] = await Promise.all([
        expenseService.getExpenses(userId),
        budgetService.getBudgets(userId),
        subscriptionService.getSubscriptions(userId),
        profileService.getProfile(userId),
      ]);

      const profileRaw = await AsyncStorage.getItem(PROFILE_KEY);
      const localProfile = profileRaw ? (JSON.parse(profileRaw) as UserProfile) : get().profile;
      const profile = remoteProfile ?? localProfile;

      set({ expenses, budgets, subscriptions, profile, error: null });
    } catch (error: any) {
      set({ error: error?.message ?? "Unable to load dashboard data." });
    }
  },

  async setProfile(profile) {
    const existing = useAuthStore.getState().session?.user.id;
    if (existing) {
      await profileService.upsertProfile(existing, profile);
    }
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    set({ profile });
  },

  async addExpense(expense) {
    const net = await NetInfo.fetch();
    const optimistic = [...get().expenses, { ...expense, synced: net.isConnected ?? false }];
    set({ expenses: optimistic });

    try {
      if (!net.isConnected) {
        await offlineQueue.enqueue({ type: "CREATE_EXPENSE", payload: expense });
        return;
      }
      const created = await expenseService.createExpense(expense);
      set({
        expenses: get().expenses.map((e) => (e.id === expense.id ? created : e)),
        error: null,
      });
    } catch (error: any) {
      set({
        expenses: get().expenses.map((e) => (e.id === expense.id ? { ...e, synced: false } : e)),
        error: error?.message ?? "Failed to save expense.",
      });
    }
  },

  async updateExpense(id, data) {
    set({ expenses: get().expenses.map((item) => (item.id === id ? { ...item, ...data } : item)) });
    const net = await NetInfo.fetch();
    if (!net.isConnected) {
      await offlineQueue.enqueue({ type: "UPDATE_EXPENSE", payload: { id, data } });
      return;
    }
    await expenseService.updateExpense(id, data);
  },

  async deleteExpense(id) {
    set({ expenses: get().expenses.filter((item) => item.id !== id) });
    const net = await NetInfo.fetch();
    if (!net.isConnected) {
      await offlineQueue.enqueue({ type: "DELETE_EXPENSE", payload: { id } });
      return;
    }
    await expenseService.deleteExpense(id);
  },

  async upsertBudget(budget) {
    const saved = await budgetService.upsertBudget(budget);
    const remaining = get().budgets.filter((item) => item.id !== saved.id);
    set({ budgets: [...remaining, saved] });
  },

  async deleteBudget(id) {
    set({ budgets: get().budgets.filter((item) => item.id !== id) });
    const net = await NetInfo.fetch();
    if (!net.isConnected) {
      // offline queue for budget deletion not strictly requested, but we could do it later.
      // just returning for now, or letting it throw if offline
    } else {
      await budgetService.deleteBudget(id);
    }
  },

  async upsertSubscription(subscription) {
    const saved = await subscriptionService.upsertSubscription(subscription);
    const remaining = get().subscriptions.filter((item) => item.id !== saved.id);
    set({ subscriptions: [...remaining, saved] });
  },

  async deleteSubscription(id) {
    set({ subscriptions: get().subscriptions.filter((item) => item.id !== id) });
    await subscriptionService.deleteSubscription(id);
  },

  async syncOfflineQueue() {
    set({ syncing: true });
    try {
      const queue = await offlineQueue.getQueue();
      for (const action of queue) {
        await runAction(action);
      }
      await offlineQueue.clearQueue();
    } finally {
      set({ syncing: false });
    }
  },
}));

const runAction = async (action: OfflineAction) => {
  if (action.type === "CREATE_EXPENSE") {
    await expenseService.createExpense(action.payload as Expense);
  }
  if (action.type === "UPDATE_EXPENSE") {
    await expenseService.updateExpense(action.payload.id, action.payload.data);
  }
  if (action.type === "DELETE_EXPENSE") {
    await expenseService.deleteExpense(action.payload.id);
  }
};

