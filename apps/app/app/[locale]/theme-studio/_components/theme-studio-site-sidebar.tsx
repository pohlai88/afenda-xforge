"use client";

import type { ReactElement } from "react";
import { HrSuiteSiteSidebar } from "../../../_components/workspace/hr-suite-site-sidebar.tsx";
import { useThemeStudioHrSuite } from "./theme-studio-hr-suite-context.tsx";

/** Theme Studio staging site sidebar — sidebar-15 collapsible groups, flat items (no tree). */
export function ThemeStudioSiteSidebar(): ReactElement {
  const { activeFeatureId, setActiveFeatureId } = useThemeStudioHrSuite();

  return (
    <HrSuiteSiteSidebar
      activeFeatureId={activeFeatureId}
      onSelect={setActiveFeatureId}
    />
  );
}
