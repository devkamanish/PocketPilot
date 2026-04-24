import { Subscription } from "../types/models";
import { supabase } from "./supaClient";

export const subscriptionService = {
  async getSubscriptions(userId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("renewal_date", { ascending: true });
    if (error) throw error;
    return data as Subscription[];
  },

  async upsertSubscription(payload: Subscription) {
    const { data, error } = await supabase
      .from("subscriptions")
      .upsert(payload, { onConflict: "id" })
      .select("*")
      .single();
    if (error) throw error;
    return data as Subscription;
  },
};
