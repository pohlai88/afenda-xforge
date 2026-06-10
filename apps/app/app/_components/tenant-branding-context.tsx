"use client";

import type { TenantBrandingSettings } from "@repo/design-system";
import { DEFAULT_TENANT_BRANDING_SETTINGS } from "@repo/design-system";
import type { ReactElement, ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

type TenantBrandingContextValue = {
  branding: TenantBrandingSettings;
  setBranding: (branding: TenantBrandingSettings) => void;
  tenantId: string;
};

const TenantBrandingContext = createContext<TenantBrandingContextValue>({
  tenantId: "tenant_default",
  branding: DEFAULT_TENANT_BRANDING_SETTINGS,
  setBranding: () => undefined,
});

type TenantBrandingProviderProps = {
  branding: TenantBrandingSettings;
  children: ReactNode;
  tenantId: string;
};

export function TenantBrandingProvider({
  branding: initialBranding,
  children,
  tenantId,
}: TenantBrandingProviderProps): ReactElement {
  const [branding, setBranding] = useState(initialBranding);

  useEffect(() => {
    setBranding(initialBranding);
  }, [initialBranding]);

  return (
    <TenantBrandingContext.Provider value={{ branding, setBranding, tenantId }}>
      {children}
    </TenantBrandingContext.Provider>
  );
}

export function useTenantBranding(): TenantBrandingContextValue {
  return useContext(TenantBrandingContext);
}
