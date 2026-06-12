"use client";

import type { ReactElement, ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import {
  HR_SUITE_DEFAULT_FEATURE_ID,
  resolveHrSuiteSiteNavItem,
  type HrSuiteSiteNavItem,
} from "../../../_components/workspace/hr-suite-site-nav.ts";

type ThemeStudioHrSuiteContextValue = {
  activeFeature: HrSuiteSiteNavItem;
  activeFeatureId: string;
  setActiveFeatureId: (featureId: string) => void;
};

const ThemeStudioHrSuiteContext = createContext<
  ThemeStudioHrSuiteContextValue | undefined
>(undefined);

export function ThemeStudioHrSuiteProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [activeFeatureId, setActiveFeatureId] = useState(
    HR_SUITE_DEFAULT_FEATURE_ID
  );

  const activeFeature =
    resolveHrSuiteSiteNavItem(activeFeatureId) ??
    resolveHrSuiteSiteNavItem(HR_SUITE_DEFAULT_FEATURE_ID)!;

  const value = useMemo(
    () => ({
      activeFeature,
      activeFeatureId: activeFeature.featureId,
      setActiveFeatureId,
    }),
    [activeFeature, setActiveFeatureId]
  );

  return (
    <ThemeStudioHrSuiteContext.Provider value={value}>
      {children}
    </ThemeStudioHrSuiteContext.Provider>
  );
}

export function useThemeStudioHrSuite(): ThemeStudioHrSuiteContextValue {
  const context = useContext(ThemeStudioHrSuiteContext);
  if (!context) {
    throw new Error(
      "useThemeStudioHrSuite must be used within ThemeStudioHrSuiteProvider"
    );
  }
  return context;
}
