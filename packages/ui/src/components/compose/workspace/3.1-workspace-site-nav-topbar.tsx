"use client";

import { cn } from "../../../lib/utils";
import type { ReactElement, ReactNode } from "react";
import {
  WORKSPACE_SHELL_CHROME_HEIGHT,
  WORKSPACE_SHELL_SPACE,
  WORKSPACE_SHELL_TYPE,
} from "./6.1-workspace-shell.typography.ts";

type WorkspaceNavSiteTopbarProps = {
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Secondary line when `scopeLabel` is not used (legacy). */
  description?: ReactNode;
  /** 6px uppercase micro label — mirrors app topbar scope row. */
  scopeLabel?: ReactNode;
  title?: ReactNode;
};

export function WorkspaceNavSiteTopbar({
  actions,
  children,
  className,
  description,
  scopeLabel,
  title,
}: WorkspaceNavSiteTopbarProps): ReactElement {
  const usesScopeStack = scopeLabel != null && scopeLabel !== "";

  return (
    <header
      className={cn(
        "flex shrink-0 items-center gap-2 antialiased",
        WORKSPACE_SHELL_SPACE.siteTopbarSurface,
        WORKSPACE_SHELL_SPACE.topbarX,
        className
      )}
      data-slot="workspace-nav-site-topbar"
      style={{ height: WORKSPACE_SHELL_CHROME_HEIGHT }}
    >
      {children ?? (
        <>
          {scopeLabel || title || description ? (
            <div
              className={cn(
                "flex min-w-0 flex-col justify-center",
                usesScopeStack ? "gap-0 leading-tight" : "leading-tight"
              )}
            >
              {usesScopeStack ? (
                <>
                  <span className={WORKSPACE_SHELL_TYPE.appTopbarScopeLabel}>
                    {scopeLabel}
                  </span>
                  {title ? (
                    <p
                      className={cn(
                        "truncate",
                        WORKSPACE_SHELL_TYPE.appTopbarItemValue
                      )}
                    >
                      {title}
                    </p>
                  ) : null}
                </>
              ) : (
                <>
                  {title ? (
                    <p
                      className={cn(
                        "truncate",
                        WORKSPACE_SHELL_TYPE.siteTopbarTitle
                      )}
                    >
                      {title}
                    </p>
                  ) : null}
                  {description ? (
                    <p
                      className={cn(
                        "truncate",
                        WORKSPACE_SHELL_TYPE.siteTopbarDescription
                      )}
                    >
                      {description}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
          {actions ? <div className="ms-auto shrink-0">{actions}</div> : null}
        </>
      )}
    </header>
  );
}
