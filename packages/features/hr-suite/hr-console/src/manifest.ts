import { hrConsoleRouteContracts } from "./contract.ts";
import {
  hrConsoleFeatureScope,
  hrConsoleOperatorCapabilities,
} from "./feature-scope.ts";
import { hrConsoleMetadata } from "./metadata.ts";
import { hrConsoleFeatureId, hrConsolePackageName } from "./shared/index.ts";

export type ModuleConsoleRegistration = Readonly<{
  apiBasePath: string;
  appBasePath: string;
  consoleId: string;
  defaultOperatorCapabilities: readonly string[];
  domainWriteCapabilityPrefixes: readonly string[];
  operatorCapabilityPrefix: string;
  packageName: string;
  status: "ready" | "deferred";
  suite: string;
  title: string;
}>;

export type HrConsoleFeatureManifest = {
  description: string;
  id: string;
  moduleConsoleRegistration: ModuleConsoleRegistration;
  packageName: string;
  routeContracts: typeof hrConsoleRouteContracts;
  title: string;
};

export const hrConsoleModuleRegistration: ModuleConsoleRegistration = {
  apiBasePath: "/api/hr/console",
  appBasePath: "/hr/console",
  consoleId: hrConsoleFeatureId,
  defaultOperatorCapabilities: hrConsoleOperatorCapabilities,
  domainWriteCapabilityPrefixes: ["hr.lam."],
  operatorCapabilityPrefix: "hr.console.",
  packageName: hrConsolePackageName,
  status: "ready",
  suite: hrConsoleFeatureScope.suite,
  title: "HR Console",
};

export const hrConsoleFeatureManifest: HrConsoleFeatureManifest = {
  id: hrConsoleFeatureId,
  title: "HR Console",
  description:
    "Suite-level HR console for operator governance, delegation, and LAM configuration entrypoints.",
  packageName: hrConsoleFeatureScope.packageName,
  moduleConsoleRegistration: hrConsoleModuleRegistration,
  routeContracts: hrConsoleRouteContracts,
};
