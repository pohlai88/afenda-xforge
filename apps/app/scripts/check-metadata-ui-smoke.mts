import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dashboardPagePath = fileURLToPath(
  new URL("../app/(authenticated)/dashboard/page.tsx", import.meta.url)
);
const dashboardViewPath = fileURLToPath(
  new URL(
    "../app/(authenticated)/dashboard/dashboard-view.tsx",
    import.meta.url
  )
);

const dashboardPageSource = readFileSync(dashboardPagePath, "utf8");
const dashboardViewSource = readFileSync(dashboardViewPath, "utf8");

assert.match(
  dashboardPageSource,
  /resolveLayeredCustomizedEntityMetadata/,
  "dashboard page must resolve layered customization before rendering metadata UI"
);
assert.match(
  dashboardPageSource,
  /loadDashboardMetadataCustomizations/,
  "dashboard page must load dashboard customization layers from the server path"
);
assert.doesNotMatch(
  dashboardPageSource,
  /@repo\/metadata-ui\/src\//,
  "dashboard page must not import metadata-ui internals"
);

assert.match(
  dashboardViewSource,
  /from\s+["']@repo\/metadata-ui(?:\/components)?["']/,
  "dashboard view must consume metadata-ui through an explicit package subpath"
);
assert.doesNotMatch(
  dashboardViewSource,
  /@repo\/metadata-ui\/src\//,
  "dashboard view must not import metadata-ui internals"
);
assert.match(
  dashboardViewSource,
  /if \(state\.status === "forbidden"\)[\s\S]*?<EntityMetadataPanel[\s\S]*?forbidden[\s\S]*?rows=\{\[\]\}/,
  "dashboard view must keep a governed forbidden fallback through EntityMetadataPanel"
);
assert.match(
  dashboardViewSource,
  /return \(\s*<EntityMetadataPanel[\s\S]*?rows=\{state\.data\.items\}[\s\S]*?totalRecords=\{state\.data\.total\}/,
  "dashboard view must keep a ready metadata-ui consumer path through EntityMetadataPanel"
);

console.log("app metadata-ui smoke checks passed");
