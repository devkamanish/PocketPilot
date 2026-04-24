import { createClient } from "@supabase/supabase-js";
import { env, hasSupabaseConfig } from "../config/env";
import { secureStorageAdapter } from "./secureStorage";

// Prevent hard crash during module import when env vars are not yet injected.
// Real config validity is enforced by ensureSupabaseConfigured().
const fallbackUrl = "https://placeholder.supabase.co";
const fallbackAnonKey = "placeholder-anon-key";
export const isUsingSupabaseFallback = !hasSupabaseConfig;

export const supabase = createClient(env.supabaseUrl || fallbackUrl, env.supabaseAnonKey || fallbackAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: secureStorageAdapter,
  },
});

export const ensureSupabaseConfigured = () => {
  if (!hasSupabaseConfig) {
    throw new Error(
      "Supabase credentials missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
};
