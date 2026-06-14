"use client";

import {
  resolveGeistSemanticCssVars,
  VERCEL_GEIST_THEME_PRESET_NAME,
} from "@repo/design-system/contracts/afenda/references";
import type { AfendaColorTokenMode as ColorMode } from "@repo/design-system/contracts/afenda/registries";
import { cssVarMapToInlineStyle } from "@repo/design-system/customise-branding/resolution";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { useSyncExternalStore } from "react";

type GeistStudioScopeProps = {
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

export function GeistStudioScope({
  children,
  className,
}: GeistStudioScopeProps): ReactElement {
  const mode = useResolvedColorMode();
  const style = cssVarMapToInlineStyle(
    resolveGeistSemanticCssVars(mode)
  ) as CSSProperties;

  return (
    <div
      className={className}
      data-geist-studio=""
      data-theme-preset={VERCEL_GEIST_THEME_PRESET_NAME}
      style={style}
    >
      {children}
    </div>
  );
}
