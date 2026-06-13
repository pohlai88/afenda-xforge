"use client";

import { resolveTenantDensityDataAttribute } from "@repo/design-system/customise-branding/resolution";
import type { ReactElement } from "react";
import { useEffect } from "react";
import { useTenantBranding } from "./tenant-branding-context.tsx";

export function TenantDensitySync(): ReactElement | null {
  const { tenantBranding } = useTenantBranding();

  useEffect(() => {
    const densityAttribute =
      resolveTenantDensityDataAttribute(tenantBranding)["data-density"];

    if (densityAttribute) {
      document.documentElement.setAttribute("data-density", densityAttribute);
      return;
    }

    document.documentElement.removeAttribute("data-density");
  }, [tenantBranding]);

  return null;
}
