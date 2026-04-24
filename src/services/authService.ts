import { supabase } from "./supaClient";

export const authService = {
  signUp: async (email: string, password: string) =>
    supabase.auth.signUp({ email, password }),

  signInWithPassword: async (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signOut: async () => supabase.auth.signOut(),

  resetPassword: async (email: string) =>
    supabase.auth.resetPasswordForEmail(email),
};
