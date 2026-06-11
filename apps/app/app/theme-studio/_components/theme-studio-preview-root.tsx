"use client";

import type { TenantBrandingSettings } from "@repo/design-system";
import { DEFAULT_TENANT_BRANDING_SETTINGS } from "@repo/design-system";
import type { ReactElement, ReactNode } from "react";
import { TenantBrandingDraftScope } from "../../_components/tenant-branding-draft-scope.tsx";

type ThemeStudioPreviewRootProps = {
  branding?: TenantBrandingSettings;
  children: ReactNode;
  className?: string;
};

export function ThemeStudioPreviewRoot({
  branding = DEFAULT_TENANT_BRANDING_SETTINGS,
  children,
  className,
}: ThemeStudioPreviewRootProps): ReactElement {
  return (
    <TenantBrandingDraftScope branding={branding} className={className}>
      {children}
    </TenantBrandingDraftScope>
  );
}
