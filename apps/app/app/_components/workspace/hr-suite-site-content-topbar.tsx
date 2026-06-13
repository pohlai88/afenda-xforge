"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui";
import {
  WORKSPACE_SHELL_TYPE,
  WorkspaceNavSiteTopbar,
} from "@repo/ui/components/compose/workspace";
import { cn } from "@repo/ui/lib/utils";
import type { ReactElement, ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";
import {
  HR_SUITE_DEFAULT_FEATURE_ID,
  HR_SUITE_FEATURE,
  resolveHrSuiteFeatureFromPathname,
  resolveHrSuiteSiteNavGroup,
  resolveHrSuiteSiteNavItem,
} from "./hr-suite-site-nav.ts";
import { WORKSPACE_STANDARD_METADATA_LABEL_CLASS } from "./workspace-shell.classes.ts";

type HrSuiteSiteContentTopbarProps = {
  actions?: ReactNode;
  activeFeatureId?: string;
  leading?: ReactNode;
};

function resolveBreadcrumbSegments(activeFeatureId: string) {
  const fallbackFeature = resolveHrSuiteSiteNavItem(
    HR_SUITE_DEFAULT_FEATURE_ID
  );
  const feature = resolveHrSuiteSiteNavItem(activeFeatureId) ?? fallbackFeature;

  if (!feature) {
    throw new Error("HR Suite default feature is not configured.");
  }

  const fallbackGroup = resolveHrSuiteSiteNavGroup(HR_SUITE_DEFAULT_FEATURE_ID);
  const group = resolveHrSuiteSiteNavGroup(feature.featureId) ?? fallbackGroup;

  if (!group) {
    throw new Error("HR Suite default navigation group is not configured.");
  }

  return {
    feature,
    group,
  };
}

export function HrSuiteSiteContentTopbar({
  actions,
  activeFeatureId: controlledFeatureId,
  leading,
}: HrSuiteSiteContentTopbarProps): ReactElement {
  const pathname = usePathname();
  const resolved =
    controlledFeatureId == null
      ? resolveHrSuiteFeatureFromPathname(pathname)
      : resolveBreadcrumbSegments(controlledFeatureId);

  const { feature, group } =
    resolved ?? resolveBreadcrumbSegments(HR_SUITE_DEFAULT_FEATURE_ID);

  return (
    <WorkspaceNavSiteTopbar className="bg-background">
      {leading}
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList
          className={cn(
            "min-w-0 flex-nowrap",
            WORKSPACE_SHELL_TYPE.appTopbarBreadcrumb
          )}
        >
          <BreadcrumbItem className="shrink-0">
            <span className={WORKSPACE_STANDARD_METADATA_LABEL_CLASS}>
              {HR_SUITE_FEATURE.navLabel}
            </span>
          </BreadcrumbItem>
          <BreadcrumbSeparator
            className={WORKSPACE_SHELL_TYPE.appTopbarSeparator}
          />
          <BreadcrumbItem className="min-w-0 shrink">
            <span
              className={cn(
                "truncate",
                WORKSPACE_STANDARD_METADATA_LABEL_CLASS
              )}
            >
              {group.navLabel}
            </span>
          </BreadcrumbItem>
          <BreadcrumbSeparator
            className={WORKSPACE_SHELL_TYPE.appTopbarSeparator}
          />
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage
              className={cn(
                "truncate",
                WORKSPACE_STANDARD_METADATA_LABEL_CLASS
              )}
            >
              {feature.navLabel}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {actions ? <div className="ms-auto shrink-0">{actions}</div> : null}
    </WorkspaceNavSiteTopbar>
  );
}
