"use client";

import type {
  TenantBrandingSettings,
  UserBrandingPreferences,
} from "@repo/design-system";
import {
  DEFAULT_TENANT_BRANDING_SETTINGS,
  EMPTY_USER_BRANDING_PREFERENCES,
  mergeEffectiveBranding,
} from "@repo/design-system";
import type { ReactElement, ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemePreferenceSync } from "./theme-preference-sync.tsx";

type TenantBrandingContextValue = {
  effectiveBranding: TenantBrandingSettings;
  setTenantBranding: (branding: TenantBrandingSettings) => void;
  setUserPreferences: (preferences: UserBrandingPreferences) => void;
  tenantBranding: TenantBrandingSettings;
  tenantId: string;
  userId: string;
  userPreferences: UserBrandingPreferences;
};

const TenantBrandingContext = createContext<TenantBrandingContextValue>({
  tenantId: "tenant_default",
  userId: "user_default",
  tenantBranding: DEFAULT_TENANT_BRANDING_SETTINGS,
  userPreferences: EMPTY_USER_BRANDING_PREFERENCES,
  effectiveBranding: DEFAULT_TENANT_BRANDING_SETTINGS,
  setTenantBranding: () => undefined,
  setUserPreferences: () => undefined,
});

type TenantBrandingProviderProps = {
  children: ReactNode;
  tenantBranding: TenantBrandingSettings;
  tenantId: string;
  userId: string;
  userPreferences?: UserBrandingPreferences;
};

export function TenantBrandingProvider({
  children,
  tenantBranding: initialTenantBranding,
  tenantId,
  userId,
  userPreferences: initialUserPreferences = EMPTY_USER_BRANDING_PREFERENCES,
}: TenantBrandingProviderProps): ReactElement {
  const [tenantBranding, setTenantBranding] = useState(initialTenantBranding);
  const [userPreferences, setUserPreferences] = useState(
    initialUserPreferences
  );

  useEffect(() => {
    setTenantBranding(initialTenantBranding);
  }, [initialTenantBranding]);

  useEffect(() => {
    setUserPreferences(initialUserPreferences);
  }, [initialUserPreferences]);

  const effectiveBranding = useMemo(
    () => mergeEffectiveBranding(tenantBranding, userPreferences),
    [tenantBranding, userPreferences]
  );

  return (
    <TenantBrandingContext.Provider
      value={{
        tenantId,
        userId,
        tenantBranding,
        userPreferences,
        effectiveBranding,
        setTenantBranding,
        setUserPreferences,
      }}
    >
      <ThemePreferenceSync />
      {children}
    </TenantBrandingContext.Provider>
  );
}

export function useTenantBranding(): TenantBrandingContextValue {
  return useContext(TenantBrandingContext);
}
