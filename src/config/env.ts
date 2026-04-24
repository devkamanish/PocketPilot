const sanitize = (value?: string) => value?.trim().replace(/^["']|["']$/g, "") ?? "";

const EXPO_PUBLIC_SUPABASE_URL = sanitize(process.env.EXPO_PUBLIC_SUPABASE_URL);
const EXPO_PUBLIC_SUPABASE_ANON_KEY = sanitize(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

export const env = {
  supabaseUrl: EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: EXPO_PUBLIC_SUPABASE_ANON_KEY,
};

export const hasSupabaseConfig =
  env.supabaseUrl.length > 0 && env.supabaseAnonKey.length > 0;
