import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const dashboardPagePath = fileURLToPath(
  new URL("../app/(authenticated)/dashboard/page.tsx", import.meta.url)
);
const dashboardPageSource = readFileSync(dashboardPagePath, "utf8");

assert.match(
  dashboardPageSource,
  /from\s+["']@repo\/metadata-ui["']/,
  "dashboard page must consume metadata-ui through the public package export"
);
assert.doesNotMatch(
  dashboardPageSource,
  /@repo\/metadata-ui\/src\//,
  "dashboard page must not import metadata-ui internals"
);

assert.match(
  dashboardPageSource,
  /if \(state\.status === "forbidden"\)[\s\S]*?<EntityMetadataPanel[\s\S]*?forbidden[\s\S]*?rows=\{\[\]\}/,
  "dashboard page must keep a governed forbidden fallback through EntityMetadataPanel"
);
assert.match(
  dashboardPageSource,
  /return \(\s*<EntityMetadataPanel[\s\S]*?rows=\{state\.data\.items\}[\s\S]*?totalRecords=\{state\.data\.total\}/,
  "dashboard page must keep a ready metadata-ui consumer path through EntityMetadataPanel"
);

console.log("app metadata-ui smoke checks passed");
