"use client";

import type {
  AuthChangeEvent,
  Session,
  SupabaseClient,
} from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { createBrowserSupabaseClient } from "./client.js";

type AuthClientContextValue = {
  client: SupabaseClient;
};

const AuthClientContext = createContext<AuthClientContextValue | null>(null);

export type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps): ReactNode => {
  const [client] = useState(() => createBrowserSupabaseClient());

  if (!client) {
    return children;
  }

  return (
    <AuthClientContext.Provider value={{ client }}>
      <AuthStateSync client={client} />
      {children}
    </AuthClientContext.Provider>
  );
};

const AuthStateSync = ({ client }: AuthClientContextValue): ReactNode => {
  const router = useRouter();
  const lastAccessTokenRef = useRef<string | null>(null);
  const handleAuthStateChange = useEffectEvent(
    (event: AuthChangeEvent, session: Session | null): void => {
      const nextAccessToken = session?.access_token ?? null;

      if (event === "INITIAL_SESSION") {
        lastAccessTokenRef.current = nextAccessToken;
        return;
      }

      if (
        event !== "SIGNED_OUT" &&
        lastAccessTokenRef.current === nextAccessToken
      ) {
        return;
      }

      lastAccessTokenRef.current = nextAccessToken;
      startTransition(() => {
        router.refresh();
      });
    }
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      handleAuthStateChange(event, session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  return null;
};

export const useAuthClient = (): SupabaseClient => {
  const context = useContext(AuthClientContext);

  if (!context) {
    throw new Error("useAuthClient must be used within AuthProvider");
  }

  return context.client;
};
