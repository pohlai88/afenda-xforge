"use client";

import type { ReactElement, ReactNode } from "react";
import { FeatureLaneScope } from "./feature-lane-scope.tsx";
import { useTenantBranding } from "./tenant-branding-context.tsx";

type AuthenticatedFeatureScopeProps = {
  children: ReactNode;
  className?: string;
  featureId: string;
};

export function AuthenticatedFeatureScope({
  children,
  className,
  featureId,
}: AuthenticatedFeatureScopeProps): ReactElement {
  const { effectiveBranding, tenantId } = useTenantBranding();

  return (
    <FeatureLaneScope
      branding={effectiveBranding}
      className={className}
      featureId={featureId}
      tenantId={tenantId}
    >
      {children}
    </FeatureLaneScope>
  );
}
