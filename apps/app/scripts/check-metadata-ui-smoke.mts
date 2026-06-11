import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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
const auditViewPath = fileURLToPath(
  new URL("../app/(authenticated)/audit/audit-view.tsx", import.meta.url)
);
const metadataContextPath = fileURLToPath(
  new URL("../app/_lib/metadata-context.ts", import.meta.url)
);
const metadataFeatureShellPath = fileURLToPath(
  new URL("../app/_components/metadata-feature-shell.tsx", import.meta.url)
);
const documentsPagePath = fileURLToPath(
  new URL("../app/(authenticated)/hr/documents/page.tsx", import.meta.url)
);
const documentsViewPath = fileURLToPath(
  new URL(
    "../app/(authenticated)/hr/documents/documents-view.tsx",
    import.meta.url
  )
);
const documentDetailViewPath = fileURLToPath(
  new URL(
    "../app/(authenticated)/hr/documents/document-detail-view.tsx",
    import.meta.url
  )
);
const documentsDirectoryPanelPath = fileURLToPath(
  new URL(
    "../app/(authenticated)/hr/documents/_components/documents-directory-panel.tsx",
    import.meta.url
  )
);
const documentDetailPagePath = fileURLToPath(
  new URL(
    "../app/(authenticated)/hr/documents/[documentId]/page.tsx",
    import.meta.url
  )
);
const documentUploadFormPath = fileURLToPath(
  new URL(
    "../app/(authenticated)/hr/documents/document-upload-form.tsx",
    import.meta.url
  )
);
const hrHubPagePath = fileURLToPath(
  new URL("../app/(authenticated)/hr/page.tsx", import.meta.url)
);
const hrHubViewPath = fileURLToPath(
  new URL("../app/(authenticated)/hr/hr-hub-view.tsx", import.meta.url)
);
const assistantPagePath = fileURLToPath(
  new URL("../app/(authenticated)/assistant/page.tsx", import.meta.url)
);
const assistantViewPath = fileURLToPath(
  new URL(
    "../app/(authenticated)/assistant/assistant-view.tsx",
    import.meta.url
  )
);
const documentSummaryListPath = fileURLToPath(
  new URL(
    "../app/(authenticated)/hr/documents/_components/document-summary-list.tsx",
    import.meta.url
  )
);

const dashboardPageSource = readFileSync(dashboardPagePath, "utf8");
const dashboardViewSource = readFileSync(dashboardViewPath, "utf8");
const auditPageSource = readFileSync(auditPagePath, "utf8");
const auditViewSource = readFileSync(auditViewPath, "utf8");
const metadataContextSource = readFileSync(metadataContextPath, "utf8");
const metadataFeatureShellSource = readFileSync(
  metadataFeatureShellPath,
  "utf8"
);
const documentsPageSource = readFileSync(documentsPagePath, "utf8");
const documentsViewSource = readFileSync(documentsViewPath, "utf8");
const documentDetailViewSource = readFileSync(documentDetailViewPath, "utf8");
const documentsDirectoryPanelSource = readFileSync(
  documentsDirectoryPanelPath,
  "utf8"
);
const documentDetailPageSource = readFileSync(documentDetailPagePath, "utf8");
const documentUploadFormSource = readFileSync(documentUploadFormPath, "utf8");
const hrHubPageSource = readFileSync(hrHubPagePath, "utf8");
const hrHubViewSource = readFileSync(hrHubViewPath, "utf8");
const assistantPageSource = readFileSync(assistantPagePath, "utf8");
const assistantViewSource = readFileSync(assistantViewPath, "utf8");

assert.match(
  metadataContextSource,
  /export function createAppMetadataContext/,
  "app must expose createAppMetadataContext for metadata-ui surfaces"
);
assert.match(
  metadataFeatureShellSource,
  /MetadataFeatureShell/,
  "app must expose MetadataFeatureShell for governed feature shells"
);

assert.match(
  dashboardPageSource,
  /loadDashboardMetadataCustomizations/,
  "dashboard page must load dashboard customization layers from the server path"
);
assert.match(
  dashboardPageSource,
  /createAppMetadataContext/,
  "dashboard page must create metadata render context on the server"
);
assert.doesNotMatch(
  dashboardPageSource,
  /resolveLayeredCustomizedEntityMetadata/,
  "dashboard page must not pre-resolve metadata when customizationLayers are passed to metadata-ui"
);
assert.match(
  dashboardPageSource,
  /customizationLayers: customizations\.customers/,
  "dashboard page must pass customer customizationLayers to DashboardView"
);

assert.match(
  dashboardViewSource,
  /from\s+["']@repo\/metadata-ui\/components["']/,
  "dashboard view must consume metadata-ui through @repo/metadata-ui/components"
);
assert.match(
  dashboardViewSource,
  /MetadataSectionStack/,
  "dashboard view must render KPI sections through MetadataSectionStack"
);
assert.match(
  dashboardViewSource,
  /customizationLayers/,
  "dashboard view must pass customizationLayers to EntityMetadataPanel"
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
assert.doesNotMatch(
  dashboardViewSource,
  /KpiCard/,
  "dashboard view must use native stat sections instead of KpiCard wrappers"
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

assert.match(
  auditPageSource,
  /createAppMetadataContext/,
  "audit page must create metadata render context on the server"
);
assert.match(
  auditPageSource,
  /MetadataFeatureShell/,
  "audit page must route forbidden/error states through MetadataFeatureShell"
);
assert.match(
  auditPageSource,
  /loadEntityMetadataCustomizations/,
  "audit page must load customization layers for EntityMetadataPanel"
);
assert.match(
  auditPageSource,
  /<AuditView/,
  "audit page must delegate ready-state composition to AuditView"
);
assert.doesNotMatch(
  auditPageSource,
  /ActivityTable/,
  "audit page must not import the deprecated ActivityTable adapter"
);

assert.match(
  auditViewSource,
  /EntityMetadataPanel/,
  "audit view must render the event ledger through EntityMetadataPanel"
);
assert.match(
  auditViewSource,
  /customizationLayers/,
  "audit view must pass customizationLayers to EntityMetadataPanel"
);
assert.match(
  auditViewSource,
  /MetadataSectionStack/,
  "audit view must render KPI sections through MetadataSectionStack"
);
assert.match(
  auditViewSource,
  /from\s+["']@repo\/metadata-ui\/components["']/,
  "audit view must consume metadata-ui through @repo/metadata-ui/components"
);
assert.doesNotMatch(
  auditViewSource,
  /resolveOutcomeBadgeTone|resolveOutcomeKpiTone|resolveStatusTone|KpiCard/,
  "audit view must not keep bespoke outcome tone resolvers or KpiCard wrappers"
);
assert.match(
  auditViewSource,
  /audit-activity-feed/,
  "audit view must render activity preview through MetadataSectionStack list section"
);

assert.match(
  documentsPageSource,
  /createAppMetadataContext/,
  "documents page must create metadata render context on the server"
);
assert.match(
  documentsPageSource,
  /MetadataFeatureShell/,
  "documents page must route forbidden/error states through MetadataFeatureShell"
);
assert.match(
  documentsPageSource,
  /loadEntityMetadataCustomizations/,
  "documents page must load customization layers for EntityMetadataPanel"
);
assert.match(
  documentsPageSource,
  /<DocumentsView/,
  "documents page must delegate ready-state composition to DocumentsView"
);

assert.match(
  documentsViewSource,
  /DocumentsDirectoryPanel/,
  "documents view must render the document directory through DocumentsDirectoryPanel"
);
assert.match(
  documentsDirectoryPanelSource,
  /EntityMetadataPanel/,
  "documents directory panel must delegate table rendering to EntityMetadataPanel"
);
assert.match(
  documentsDirectoryPanelSource,
  /onRowClick/,
  "documents directory panel must navigate to document detail on row click"
);
assert.match(
  documentsViewSource,
  /customizationLayers/,
  "documents view must pass customizationLayers to the document directory panel"
);
assert.match(
  documentsViewSource,
  /MetadataSectionStack/,
  "documents view must render KPI sections through MetadataSectionStack"
);
assert.doesNotMatch(
  documentsViewSource,
  /resolveDocumentStatusTone|resolveVisibilityTone|document-summary-list/,
  "documents view must not keep bespoke HR tone resolvers or legacy list adapters"
);

assert.equal(
  existsSync(documentSummaryListPath),
  false,
  "document-summary-list must be deleted after HR list migration"
);

assert.match(
  documentDetailPageSource,
  /loadEntityMetadataCustomizations/,
  "document detail page must load customization layers"
);
assert.match(
  documentDetailPageSource,
  /customizationLayers={customizations}/,
  "document detail page must pass customizationLayers to DocumentDetailView"
);
assert.match(
  documentDetailViewSource,
  /customizationLayers={customizationLayers}/,
  "document detail view must pass customizationLayers to metadata-ui orchestrators"
);
assert.match(
  documentDetailViewSource,
  /MetadataSectionStack/,
  "document detail view must render sections through MetadataSectionStack"
);
assert.match(
  documentDetailViewSource,
  /MetadataForm/,
  "document detail view must render readonly MetadataForm sections"
);
assert.doesNotMatch(
  documentDetailViewSource,
  /resolveStatusTone|StatusBadge/,
  "document detail view must use metadata-ui status renderers instead of app StatusBadge"
);

assert.match(
  documentUploadFormSource,
  /MetadataForm/,
  "document upload form must render scalar fields through MetadataForm"
);
assert.doesNotMatch(
  documentUploadFormSource,
  /resolveDocumentStatusTone|resolveVisibilityTone/,
  "document upload form must not keep bespoke HR tone resolvers"
);

assert.match(
  hrHubPageSource,
  /createAppMetadataContext/,
  "HR hub page must create metadata render context on the server"
);
assert.match(
  hrHubViewSource,
  /MetadataSectionStack/,
  "HR hub view must render sections through MetadataSectionStack"
);

assert.match(
  hrHubPageSource,
  /loadHrHubPageData/,
  "HR hub page must load hub data on the server"
);
assert.match(
  hrHubViewSource,
  /kind: "list"/,
  "HR hub view must render list sections"
);
assert.match(
  hrHubViewSource,
  /kind: "timeline"/,
  "HR hub view must render timeline sections"
);
assert.match(
  hrHubViewSource,
  /kind: "form"/,
  "HR hub view must render form preview sections"
);
assert.match(
  dashboardViewSource,
  /kind: "activity"/,
  "dashboard view must render activity sections"
);
assert.match(
  auditViewSource,
  /kind: "workflow"/,
  "audit view must render workflow preview sections"
);
assert.match(
  auditViewSource,
  /kind: "approval"/,
  "audit view must render approval preview sections"
);
assert.match(
  auditViewSource,
  /kind: "activity"/,
  "audit view must render activity preview sections"
);
assert.match(
  documentDetailViewSource,
  /kind: "timeline"/,
  "document detail view must render timeline sections"
);

assert.match(
  assistantPageSource,
  /createAppMetadataContext/,
  "assistant page must create metadata render context on the server"
);
assert.match(
  assistantViewSource,
  /MetadataSectionStack/,
  "assistant view must render KPI sections through MetadataSectionStack"
);
assert.doesNotMatch(
  assistantViewSource,
  /KpiCard/,
  "assistant view must not use bespoke KpiCard wrappers"
);

for (const [label, source] of [
  ["dashboard page", dashboardPageSource],
  ["audit view", auditViewSource],
  ["documents view", documentsViewSource],
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
}

assert.match(
  metadataFeatureShellSource,
  /from\s+["']@repo\/metadata-ui\/components["']/,
  "metadata feature shell must import metadata-ui components through explicit package subpath"
);

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
