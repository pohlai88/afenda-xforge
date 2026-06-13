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
  const { effectiveBranding } = useTenantBranding();

  return (
    <FeatureLaneScope
      branding={effectiveBranding}
      className={className}
      featureId={featureId}
    >
      {children}
    </FeatureLaneScope>
  );
}
