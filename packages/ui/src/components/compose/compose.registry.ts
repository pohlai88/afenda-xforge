import { alertPatternCatalog } from "./alert/alert.catalog";
import { autocompletePatternCatalog } from "./autocomplete/autocomplete.catalog";
import { badgePatternCatalog } from "./badge/badge.catalog";
import type { ComposeRegistryGroup } from "./compose.contract";
import { dataGridPatternCatalog } from "./data-grid/data-grid.catalog";
import { dateSelectorPatternCatalog } from "./date-selector/date-selector.catalog";
import { fileUploadPatternCatalog } from "./file-upload/file-upload.catalog";
import { filtersPatternCatalog } from "./filters/filters.catalog";
import { framePatternCatalog } from "./frame/frame.catalog";
import { kanbanPatternCatalog } from "./kanban/kanban.catalog";
import { lineChartPatternCatalog } from "./line-chart/line-chart.catalog";
import { numberFieldPatternCatalog } from "./number-field/number-field.catalog";
import { phoneInputPatternCatalog } from "./phone-input/phone-input.catalog";
import { ratingPatternCatalog } from "./rating/rating.catalog";
import { scrollspyPatternCatalog } from "./scrollspy/scrollspy.catalog";
import { sortablePatternCatalog } from "./sortable/sortable.catalog";
import { statisticCardPatternCatalog } from "./statistic-card/statistic-card.catalog";

export const composeRegistryGroups = [
  {
    name: "alert",
    title: "Alerts",
    description:
      "Generic feedback states for status, warning, and action prompts.",
    kind: "feedback",
    metadataRoles: ["feedback", "state"],
    capabilities: ["empty-state", "loading-state"],
    readiness: "metadata-ready",
    patterns: alertPatternCatalog,
  },
  {
    name: "autocomplete",
    title: "Autocomplete",
    description: "Searchable selection patterns for metadata-backed fields.",
    kind: "data-entry",
    metadataRoles: ["field"],
    capabilities: ["async", "controlled", "filtering", "form"],
    readiness: "metadata-ready",
    patterns: autocompletePatternCatalog,
  },
  {
    name: "badge",
    title: "Badges",
    description: "Compact labels for status, counts, and metadata attributes.",
    kind: "data-display",
    metadataRoles: ["feedback", "state"],
    capabilities: ["summary"],
    readiness: "metadata-ready",
    patterns: badgePatternCatalog,
  },
  {
    name: "data-grid",
    title: "Data Grids",
    description:
      "Collection surfaces for metadata tables and operational lists.",
    kind: "data-display",
    metadataRoles: ["collection", "section"],
    capabilities: [
      "bulk-action",
      "crud",
      "density",
      "drag-and-drop",
      "filtering",
      "loading-state",
      "pagination",
      "selection",
      "sorting",
      "summary",
      "virtualization",
    ],
    readiness: "metadata-ready",
    patterns: dataGridPatternCatalog,
  },
  {
    name: "date-selector",
    title: "Date Selectors",
    description: "Date input compositions for forms and filters.",
    kind: "data-entry",
    metadataRoles: ["field"],
    capabilities: ["controlled", "filtering", "form", "validation"],
    readiness: "metadata-ready",
    patterns: dateSelectorPatternCatalog,
  },
  {
    name: "file-upload",
    title: "File Upload",
    description: "Upload inputs for attachment fields and document workflows.",
    kind: "data-entry",
    metadataRoles: ["field"],
    capabilities: ["controlled", "form", "validation"],
    readiness: "metadata-ready",
    patterns: fileUploadPatternCatalog,
  },
  {
    name: "filters",
    title: "Filters",
    description: "Filter bars and query controls for metadata collections.",
    kind: "interaction",
    metadataRoles: ["collection"],
    capabilities: ["controlled", "filtering", "validation"],
    readiness: "metadata-ready",
    patterns: filtersPatternCatalog,
  },
  {
    name: "frame",
    title: "Frames",
    description:
      "Section shells for metadata panels, forms, and detail regions.",
    kind: "layout",
    metadataRoles: ["layout", "section"],
    capabilities: ["density"],
    readiness: "metadata-ready",
    patterns: framePatternCatalog,
  },
  {
    name: "kanban",
    title: "Kanban",
    description: "State-grouped collection views for workflow metadata.",
    kind: "data-display",
    metadataRoles: ["collection", "state"],
    capabilities: ["drag-and-drop", "summary"],
    readiness: "metadata-ready",
    patterns: kanbanPatternCatalog,
  },
  {
    name: "line-chart",
    title: "Line Charts",
    description: "Trend visualizations for metadata-backed metrics.",
    kind: "visualization",
    metadataRoles: ["metric", "visualization"],
    capabilities: ["summary"],
    readiness: "metadata-ready",
    patterns: lineChartPatternCatalog,
  },
  {
    name: "number-field",
    title: "Number Fields",
    description: "Numeric field patterns for forms, filters, and quantities.",
    kind: "data-entry",
    metadataRoles: ["field"],
    capabilities: ["controlled", "form", "validation"],
    readiness: "metadata-ready",
    patterns: numberFieldPatternCatalog,
  },
  {
    name: "phone-input",
    title: "Phone Inputs",
    description: "Phone number entry patterns for contact metadata.",
    kind: "data-entry",
    metadataRoles: ["field"],
    capabilities: ["controlled", "form", "validation"],
    readiness: "metadata-ready",
    patterns: phoneInputPatternCatalog,
  },
  {
    name: "rating",
    title: "Ratings",
    description: "Rating inputs and readonly rating displays.",
    kind: "data-entry",
    metadataRoles: ["field", "metric"],
    capabilities: ["controlled", "form"],
    readiness: "metadata-ready",
    patterns: ratingPatternCatalog,
  },
  {
    name: "scrollspy",
    title: "Scrollspy",
    description: "Navigation affordances for long metadata detail pages.",
    kind: "navigation",
    metadataRoles: ["navigation", "section"],
    capabilities: [],
    readiness: "metadata-ready",
    patterns: scrollspyPatternCatalog,
  },
  {
    name: "sortable",
    title: "Sortable",
    description:
      "Reorderable lists and grids for ordered metadata collections.",
    kind: "interaction",
    metadataRoles: ["collection"],
    capabilities: ["controlled", "drag-and-drop"],
    readiness: "metadata-ready",
    patterns: sortablePatternCatalog,
  },
  {
    name: "statistic-card",
    title: "Statistic Cards",
    description:
      "Metric summaries for dashboards and metadata overview panels.",
    kind: "data-display",
    metadataRoles: ["metric", "section"],
    capabilities: ["summary"],
    readiness: "metadata-ready",
    patterns: statisticCardPatternCatalog,
  },
] as const satisfies readonly ComposeRegistryGroup[];

export type ComposeRegistryGroupName =
  (typeof composeRegistryGroups)[number]["name"];

export const composeRegistryGroupNames = composeRegistryGroups.map(
  (group) => group.name,
) as ComposeRegistryGroupName[];

export const composeRegistryPatternCount = composeRegistryGroups.reduce(
  (total, group) => total + group.patterns.length,
  0,
);

export function getComposeRegistryGroup(
  name: ComposeRegistryGroupName,
): (typeof composeRegistryGroups)[number] | undefined {
  return composeRegistryGroups.find((group) => group.name === name);
}

export function getComposeRegistryPattern(
  groupName: ComposeRegistryGroupName,
  patternName: string,
): ComposeRegistryGroup["patterns"][number] | undefined {
  return getComposeRegistryGroup(groupName)?.patterns.find(
    (pattern) => pattern.name === patternName,
  );
}
