import { Budget } from "../types/models";
import { supabase } from "./supaClient";

export const budgetService = {
  async getBudgets(userId: string): Promise<Budget[]> {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return (data || []).map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      category: item.category,
      limit: Number(item.limit ?? item.spending_limit ?? 0),
    })) as Budget[];
  },

  async upsertBudget(payload: Budget) {
    const row = {
      id: payload.id,
      user_id: payload.user_id,
      category: payload.category,
      // Keep backward compatibility if existing schema still uses spending_limit
      spending_limit: payload.limit,
    };
    const { data, error } = await supabase
      .from("budgets")
      .upsert(row, { onConflict: "id" })
      .select("*")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      user_id: data.user_id,
      category: data.category,
      limit: Number((data as any).limit ?? (data as any).spending_limit ?? 0),
    } as Budget;
  },
};
