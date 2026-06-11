"use client";

import type { ReactElement } from "react";
import { cn } from "../../../lib/utils";
import {
  WORKSPACE_AFENDA_BRAND_ICON,
  WORKSPACE_SHELL_SPACE,
} from "./6.1-workspace-shell.typography.ts";

const BRAND_RENDER_SIZE_PX = 512;

export type WorkspaceAppNavTopbarBrandProps = {
  className?: string;
  darkIconSrc?: string;
  homeHref?: string;
  lightIconSrc?: string;
};

/**
 * Afenda mark for app chrome — compact circular disk aligned with sidebar inset.
 * Icons are served from the host app `public/icons` directory.
 */
export function WorkspaceAppNavTopbarBrand({
  className,
  darkIconSrc = WORKSPACE_AFENDA_BRAND_ICON.dark,
  homeHref,
  lightIconSrc = WORKSPACE_AFENDA_BRAND_ICON.light,
}: WorkspaceAppNavTopbarBrandProps): ReactElement {
  const shellClass = cn(
    "flex items-center justify-center",
    WORKSPACE_SHELL_SPACE.appTopbarBrand,
    className,
  );

  const images = (
    <>
      <img
        alt=""
        className={cn(WORKSPACE_SHELL_SPACE.appTopbarBrandImg, "dark:hidden")}
        decoding="sync"
        height={BRAND_RENDER_SIZE_PX}
        src={lightIconSrc}
        width={BRAND_RENDER_SIZE_PX}
      />
      <img
        alt=""
        className={cn(
          WORKSPACE_SHELL_SPACE.appTopbarBrandImg,
          "hidden dark:block",
        )}
        decoding="sync"
        height={BRAND_RENDER_SIZE_PX}
        src={darkIconSrc}
        width={BRAND_RENDER_SIZE_PX}
      />
    </>
  );

  if (homeHref) {
    return (
      <a
        aria-label="Afenda home"
        className={cn(
          shellClass,
          "shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
        href={homeHref}
      >
        {images}
      </a>
    );
  }

  return (
    <span
      className={cn(shellClass, "shrink-0")}
      data-slot="workspace-app-nav-topbar-brand"
    >
      {images}
    </span>
  );
}
