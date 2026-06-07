import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadAuthKeys } from "./keys.js";

let cachedBrowserClient: SupabaseClient | null = null;

export const createBrowserSupabaseClient = (): SupabaseClient | null => {
  const { NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_SUPABASE_URL } =
    loadAuthKeys();

  if (!(NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && NEXT_PUBLIC_SUPABASE_URL)) {
    return null;
  }

  cachedBrowserClient ??= createBrowserClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  return cachedBrowserClient;
};
