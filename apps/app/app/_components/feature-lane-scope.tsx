"use client";

import type { AfendaTenantBrandingSettings as TenantBrandingSettings } from "@repo/design-system/contracts/afenda/customization";
import type { AfendaColorTokenMode as ColorMode } from "@repo/design-system/contracts/afenda/registries";
import {
  cssVarMapToInlineStyle,
  getTenantBranding,
  resolveActiveLaneCssVars,
} from "@repo/design-system";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { useSyncExternalStore } from "react";

type FeatureLaneScopeProps = {
  branding?: TenantBrandingSettings;
  children: ReactNode;
  className?: string;
  featureId: string;
  tenantId: string;
};

function subscribeToColorMode(onStoreChange: () => void): () => void {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => observer.disconnect();
}

function readResolvedColorMode(): ColorMode {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useResolvedColorMode(): ColorMode {
  return useSyncExternalStore(
    subscribeToColorMode,
    readResolvedColorMode,
    () => "light"
  );
}

export function FeatureLaneScope({
  branding,
  children,
  className,
  featureId,
  tenantId,
}: FeatureLaneScopeProps): ReactElement {
  const mode = useResolvedColorMode();
  const resolvedBranding = branding ?? getTenantBranding(tenantId);
  const laneVars = resolveActiveLaneCssVars(resolvedBranding, featureId, mode);
  const style = cssVarMapToInlineStyle(laneVars) as CSSProperties;

  return (
    <div
      className={className}
      data-feature={featureId}
      data-lane={laneVars["--lane-active-id"]}
      style={style}
    >
      {children}
    </div>
  );
}
