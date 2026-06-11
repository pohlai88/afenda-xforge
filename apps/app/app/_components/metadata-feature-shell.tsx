"use client";

import { MetadataStateBoundary } from "@repo/metadata-ui/components";
import type { ReactElement, ReactNode } from "react";
import { AuthenticatedFeatureScope } from "./authenticated-feature-scope.tsx";

type MetadataFeatureShellProps = {
  children?: ReactNode;
  className?: string;
  error?: string;
  featureId: string;
  forbiddenDescription?: string;
  forbiddenTitle?: string;
  state?: "error" | "forbidden" | "ready";
};

export function MetadataFeatureShell({
  children,
  className,
  error,
  featureId,
  forbiddenDescription,
  forbiddenTitle,
  state = "ready",
}: MetadataFeatureShellProps): ReactElement {
  return (
    <AuthenticatedFeatureScope className={className} featureId={featureId}>
      {state === "forbidden" ? (
        <MetadataStateBoundary
          forbiddenDescription={forbiddenDescription}
          forbiddenTitle={forbiddenTitle}
          state="forbidden"
        />
      ) : null}
      {state === "error" ? (
        <MetadataStateBoundary error={error} state="error" />
      ) : null}
      {state === "ready" ? children : null}
    </AuthenticatedFeatureScope>
  );
}
