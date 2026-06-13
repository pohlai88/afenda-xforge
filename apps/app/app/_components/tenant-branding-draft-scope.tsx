"use client";

import type { AfendaTenantBrandingSettings as TenantBrandingSettings } from "@repo/design-system/contracts/afenda/customization";
import type { AfendaColorTokenMode as ColorMode } from "@repo/design-system/contracts/afenda/registries";
import {
  cssVarMapToInlineStyle,
  resolveTenantBrandCssVars,
  resolveTenantLaneOverrideCssVars,
} from "@repo/design-system";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { useSyncExternalStore } from "react";

type TenantBrandingDraftScopeProps = {
  branding: TenantBrandingSettings;
  children: ReactNode;
  className?: string;
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

function useResolvedColorMode(): ColorMode {
  return useSyncExternalStore(
    subscribeToColorMode,
    readResolvedColorMode,
    () => "light"
  );
}

export function TenantBrandingDraftScope({
  branding,
  children,
  className,
}: TenantBrandingDraftScopeProps): ReactElement {
  const mode = useResolvedColorMode();
  const style = cssVarMapToInlineStyle({
    ...resolveTenantBrandCssVars(branding, mode),
    ...resolveTenantLaneOverrideCssVars(branding, mode),
  }) as CSSProperties;

  return (
    <div className={className} data-tenant-branding-draft="" style={style}>
      {children}
    </div>
  );
}
