import { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { hasSupabaseConfig } from "../config/env";
import { authService } from "../services/authService";
import { isUsingSupabaseFallback, supabase } from "../services/supaClient";

type AuthState = {
  session: Session | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  initialized: false,
  loading: false,
  error: null,

  initialize: async () => {
    if (!hasSupabaseConfig || isUsingSupabaseFallback) {
      set({
        session: null,
        initialized: true,
        error:
          "Supabase credentials missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env",
      });
      return;
    }
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { error: userError } = await supabase.auth.getUser();
        if (userError) {
          // Clear stale/broken session tokens to stop repeated 403 loops.
          await supabase.auth.signOut();
          set({ session: null, initialized: true, error: "Session expired. Please login again." });
          return;
        }
      }
      set({ session: data.session, initialized: true, error: null });
      supabase.auth.onAuthStateChange((_, session) => set({ session }));
    } catch (error: any) {
      set({
        session: null,
        initialized: true,
        error: error?.message ?? "Unable to initialize auth session.",
      });
    }
  },

  login: async (email, password) => {
    if (!hasSupabaseConfig || isUsingSupabaseFallback) {
      set({
        loading: false,
        error:
          "Supabase env not loaded. Restart Expo after saving .env (npm run start -- --clear).",
      });
      return false;
    }
    set({ loading: true, error: null });
    const { error } = await authService.signInWithPassword(email, password);
    set({ loading: false, error: error?.message ?? null });
    return !error;
  },

  register: async (email, password) => {
    if (!hasSupabaseConfig || isUsingSupabaseFallback) {
      set({
        loading: false,
        error:
          "Supabase env not loaded. Restart Expo after saving .env (npm run start -- --clear).",
      });
      return false;
    }
    set({ loading: true, error: null });
    const { error } = await authService.signUp(email, password);
    set({ loading: false, error: error?.message ?? null });
    return !error;
  },

  forgotPassword: async (email) => {
    if (!hasSupabaseConfig || isUsingSupabaseFallback) {
      set({
        loading: false,
        error:
          "Supabase env not loaded. Restart Expo after saving .env (npm run start -- --clear).",
      });
      return false;
    }
    set({ loading: true, error: null });
    const { error } = await authService.resetPassword(email);
    set({ loading: false, error: error?.message ?? null });
    return !error;
  },

  logout: async () => {
    await authService.signOut();
    set({ session: null });
  },
}));
