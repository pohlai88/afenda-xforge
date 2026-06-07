import "server-only";

import { UnauthorizedError } from "@repo/errors";
import type { CookieOptions } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { loadAuthKeys } from "./keys.js";

type SupabaseConfig = {
  publishableKey: string;
  url: string;
};

type CookieStore = Awaited<ReturnType<typeof cookies>>;

type CookieToSet = {
  name: string;
  options?: CookieOptions;
  value: string;
};

const getSupabaseConfig = (): SupabaseConfig | null => {
  const { NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_SUPABASE_URL } =
    loadAuthKeys();

  if (!(NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && NEXT_PUBLIC_SUPABASE_URL)) {
    return null;
  }

  return {
    publishableKey: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    url: NEXT_PUBLIC_SUPABASE_URL,
  };
};

export const createServerSupabaseClient =
  async (): Promise<SupabaseClient | null> => {
    const config = getSupabaseConfig();

    if (!config) {
      return null;
    }

    const cookieStore = await cookies();

    return createServerClient(config.url, config.publishableKey, {
      cookies: {
        getAll(): ReturnType<CookieStore["getAll"]> {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: CookieToSet[],
          _headers: Record<string, string>
        ): void {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Cookies can be read-only in some server contexts.
          }
        },
      },
    });
  };

export const createServiceRoleSupabaseClient = (): SupabaseClient | null => {
  const {
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
  } = loadAuthKeys();

  if (
    !(
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      NEXT_PUBLIC_SUPABASE_URL &&
      SUPABASE_SERVICE_ROLE_KEY
    )
  ) {
    return null;
  }

  return createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export const getSession = async (): Promise<Session | null> => {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return null;
  }

  return data.session;
};

export const getUser = async (): Promise<User | null> => {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
};

export const requireAuth = async (): Promise<User> => {
  const user = await getUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
};
