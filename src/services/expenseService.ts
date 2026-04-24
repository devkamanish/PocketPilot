import { Expense } from "../types/models";
import { supabase } from "./supaClient";

export const expenseService = {
  async getExpenses(userId: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) throw error;
    return data as Expense[];
  },

  async createExpense(payload: Omit<Expense, "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("expenses")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;
    return data as Expense;
  },

  async updateExpense(id: string, data: Partial<Expense>) {
    const { data: updated, error } = await supabase
      .from("expenses")
      .update(data)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return updated as Expense;
  },

  async deleteExpense(id: string) {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) throw error;
  },
};
