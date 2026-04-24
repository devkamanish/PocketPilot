import { UserProfile } from "../types/models";
import { supabase } from "./supaClient";

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      user_id: data.id,
      income: Number(data.income ?? 0),
      savingsGoal: Number(data.savings_goal ?? 20),
      categoryAllocations: typeof data.category_allocations === 'object' && data.category_allocations !== null ? data.category_allocations : {},
    };
  },

  async upsertProfile(userId: string, profile: UserProfile): Promise<UserProfile> {
    const payload = {
      id: userId,
      income: profile.income,
      savings_goal: profile.savingsGoal,
      category_allocations: profile.categoryAllocations ?? {},
    };
    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select("*")
      .single();
    if (error) throw error;
    return {
      user_id: data.id,
      income: Number(data.income ?? 0),
      savingsGoal: Number(data.savings_goal ?? 20),
      categoryAllocations: typeof data.category_allocations === 'object' && data.category_allocations !== null ? data.category_allocations : {},
    };
  },
};
