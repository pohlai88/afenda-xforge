import type { CookieOptions } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { loadAuthKeys } from "./keys.ts";

type SupabaseCookieToSet = {
  name: string;
  options?: CookieOptions;
  value: string;
};

export type AuthProxyResult = {
  isAuthenticated: boolean;
  response: NextResponse;
};

export const updateSession = async (
  request: NextRequest
): Promise<AuthProxyResult> => {
  const { NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_SUPABASE_URL } =
    loadAuthKeys();

  if (!(NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && NEXT_PUBLIC_SUPABASE_URL)) {
    return {
      isAuthenticated: false,
      response: NextResponse.next({ request }),
    };
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll(): ReturnType<NextRequest["cookies"]["getAll"]> {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: SupabaseCookieToSet[],
          headers: Record<string, string>
        ): void {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          supabaseResponse = NextResponse.next({
            request,
          });

          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }

          for (const [key, value] of Object.entries(headers)) {
            supabaseResponse.headers.set(key, value);
          }
        },
      },
    }
  );

  // Keep the auth refresh path contiguous so SSR cookies stay in sync.
  const { data } = await supabase.auth.getClaims();

  return {
    isAuthenticated: Boolean(data?.claims?.sub),
    response: supabaseResponse,
  };
};

export const authMiddleware: typeof updateSession = updateSession;
