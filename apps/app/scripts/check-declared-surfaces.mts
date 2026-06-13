import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import {
  WORKSPACE_APP_DECLARED_AUTHENTICATED_HREFS,
  WORKSPACE_APP_ROUTE_EXEMPTIONS,
} from "../app/_components/workspace/workspace-app-surfaces.ts";

const APP_ROOT = join(import.meta.dirname, "..");
const AUTHENTICATED_ROOT = join(APP_ROOT, "app", "[locale]", "(authenticated)");

const collectPages = (directory: string): string[] => {
  const entries = readdirSync(directory);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...collectPages(fullPath));
      continue;
    }

    if (entry === "page.tsx") {
      files.push(fullPath);
    }
  }

  return files;
};

const routeFromPage = (pagePath: string): string => {
  const routePath = relative(AUTHENTICATED_ROOT, pagePath)
    .split(sep)
    .slice(0, -1)
    .filter((segment) => !segment.startsWith("("))
    .join("/");

  return routePath.length > 0 ? `/${routePath}` : "/";
};

const exemptHrefs = new Set(
  WORKSPACE_APP_ROUTE_EXEMPTIONS.map((exemption) => exemption.href)
);

const discoveredRoutes = collectPages(AUTHENTICATED_ROOT)
  .map(routeFromPage)
  .sort((a, b) => a.localeCompare(b));

const missingRoutes = discoveredRoutes.filter(
  (route) =>
    !(
      WORKSPACE_APP_DECLARED_AUTHENTICATED_HREFS.has(route) ||
      exemptHrefs.has(route)
    )
);

if (missingRoutes.length > 0) {
  console.error("Authenticated routes missing declared app surfaces:\n");
  for (const route of missingRoutes) {
    console.error(`  - ${route}`);
  }
  console.error(
    "\nDeclare the route in workspace-app-surfaces.ts or add an explicit exemption."
  );
  process.exit(1);
}

console.log(
  `Declared app surface check passed (${discoveredRoutes.length} authenticated pages).`
);
