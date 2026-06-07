"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import { createBrowserSupabaseClient } from "./client.js";

type AuthClientContextValue = {
  client: SupabaseClient;
};

const AuthClientContext = createContext<AuthClientContextValue | null>(null);

export type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps): ReactNode => {
  const client = useMemo(() => createBrowserSupabaseClient(), []);

  if (!client) {
    return children;
  }

  return (
    <AuthClientContext.Provider value={{ client }}>
      {children}
    </AuthClientContext.Provider>
  );
};

export const useAuthClient = (): SupabaseClient => {
  const context = useContext(AuthClientContext);

  if (!context) {
    throw new Error("useAuthClient must be used within AuthProvider");
  }

  return context.client;
};
