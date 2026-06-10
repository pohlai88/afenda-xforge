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
const auditPagePath = fileURLToPath(
  new URL("../app/(authenticated)/audit/page.tsx", import.meta.url)
);
const documentsPagePath = fileURLToPath(
  new URL("../app/(authenticated)/hr/documents/page.tsx", import.meta.url)
);
const documentDetailPagePath = fileURLToPath(
  new URL(
    "../app/(authenticated)/hr/documents/[documentId]/page.tsx",
    import.meta.url
  )
);
const documentSummaryListPath = fileURLToPath(
  new URL(
    "../app/(authenticated)/hr/documents/_components/document-summary-list.tsx",
    import.meta.url
  )
);
const activityTablePath = fileURLToPath(
  new URL(
    "../app/(authenticated)/_components/activity-table.tsx",
    import.meta.url
  )
);

const dashboardPageSource = readFileSync(dashboardPagePath, "utf8");
const dashboardViewSource = readFileSync(dashboardViewPath, "utf8");
const auditPageSource = readFileSync(auditPagePath, "utf8");
const documentsPageSource = readFileSync(documentsPagePath, "utf8");
const documentDetailPageSource = readFileSync(documentDetailPagePath, "utf8");
const documentSummaryListSource = readFileSync(documentSummaryListPath, "utf8");
const activityTableSource = readFileSync(activityTablePath, "utf8");

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
  /from\s+["']@repo\/metadata-ui\/components["']/,
  "dashboard view must consume metadata-ui through @repo/metadata-ui/components"
);
assert.doesNotMatch(
  dashboardViewSource,
  /from\s+["']@repo\/metadata-ui["']/,
  "dashboard view must not import metadata-ui root barrel (MUI-008)"
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

for (const [label, source] of [
  ["dashboard page", dashboardPageSource],
  ["audit page", auditPageSource],
  ["documents page", documentsPageSource],
  ["document detail page", documentDetailPageSource],
  ["document summary list", documentSummaryListSource],
  ["activity table", activityTableSource],
] as const) {
  assert.match(
    source,
    /from\s+["']@repo\/metadata-ui\/components["']/,
    `${label} must import metadata-ui components through explicit package subpath`
  );
  assert.doesNotMatch(
    source,
    /from\s+["']@repo\/metadata-ui["']/,
    `${label} must not import metadata-ui root barrel (MUI-008)`
  );
  assert.match(
    source,
    /MetadataStateBoundary/,
    `${label} must route async/empty states through MetadataStateBoundary (Enterprise AC #3)`
  );
}

assert.doesNotMatch(
  auditPageSource,
  /renderAuditAccessError/,
  "audit page must not use bespoke forbidden/error UI"
);
assert.doesNotMatch(
  documentsPageSource,
  /renderAccessError/,
  "documents page must not use bespoke forbidden/error UI"
);
assert.doesNotMatch(
  documentDetailPageSource,
  /renderAccessError/,
  "document detail page must not use bespoke forbidden/error UI"
);
assert.doesNotMatch(
  dashboardPageSource,
  /renderDashboardAccessError/,
  "dashboard page must not use bespoke forbidden/error UI"
);

console.log("app metadata-ui smoke checks passed");
