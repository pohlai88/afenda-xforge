import type { AfendaRuntimeRule } from "../runtime-reference.contract";

const DATA_DISPLAY = "data-display" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_DATA_DISPLAY_RULES = [
  {
    id: "data-display.table-state-coverage",
    category: DATA_DISPLAY,
    severity: ERROR,
    appliesTo: ["table", "data-grid", "list", "report", "search-results"],
    rationale:
      "Enterprise data surfaces must handle empty, loading, error, filtered, and populated states without broken structure.",
    requirement:
      "Data displays must render governed loading, empty, filtered-empty, error, and populated states.",
    remediation:
      "Provide skeleton or loading rows, empty-state rows, error rows, and normal rows with stable table/list structure.",
    references: ["AFENDA:data-display-contract", "AFENDA:empty-state-contract"],
    enforcement: MANUAL,
  },
  {
    id: "data-display.column-meaning",
    category: DATA_DISPLAY,
    severity: ERROR,
    appliesTo: ["table", "data-grid", "report", "comparison-table"],
    rationale:
      "Columns must communicate meaning clearly so dense data can be understood, sorted, and exported safely.",
    requirement:
      "Columns must have clear headers, stable meaning, and appropriate alignment for their data type.",
    remediation:
      "Use explicit headers, consistent column order, type-aware alignment, and avoid repurposing a column across states.",
    references: ["AFENDA:data-display-contract", "WCAG:1.3.1"],
    enforcement: HYBRID,
  },
  {
    id: "data-display.numeric-alignment",
    category: DATA_DISPLAY,
    severity: WARNING,
    appliesTo: ["amount", "currency", "number", "metric", "table-cell", "report-cell"],
    rationale:
      "Numeric data must be easy to compare across rows, columns, and dashboard summaries.",
    requirement:
      "Comparable numeric values must use tabular numerals, consistent precision, and right alignment where appropriate.",
    remediation:
      "Use tabular numerals, locale-aware formatting, fixed precision rules, and right-align comparable numeric columns.",
    references: ["AFENDA:data-display-contract", "AFENDA:content-contract"],
    enforcement: MANUAL,
  },
  {
    id: "data-display.status-badge-contract",
    category: DATA_DISPLAY,
    severity: ERROR,
    appliesTo: ["badge", "status", "tag", "workflow-state", "approval-state", "table-cell"],
    rationale:
      "Status display must be consistent across modules to avoid operational misinterpretation.",
    requirement:
      "Status badges and tags must use approved labels, tones, and semantic mapping.",
    remediation:
      "Use canonical status labels and design-system tone variants instead of local badge colors or ad hoc wording.",
    references: ["AFENDA:data-display-contract", "AFENDA:status-tone-contract"],
    enforcement: HYBRID,
  },
  {
    id: "data-display.row-action-safety",
    category: DATA_DISPLAY,
    severity: ERROR,
    appliesTo: ["row-action", "table", "data-grid", "menu-item", "bulk-action"],
    rationale:
      "Row and bulk actions can affect the wrong record when target identity and selection state are unclear.",
    requirement:
      "Row and bulk actions must make the target record or selection scope clear before execution.",
    remediation:
      "Keep actions visually tied to rows, show selected counts for bulk actions, and name targets in confirmations.",
    references: ["AFENDA:data-display-contract", "XFORGE:mutation-pipeline"],
    enforcement: MANUAL,
  },
  {
    id: "data-display.sort-filter-indicators",
    category: DATA_DISPLAY,
    severity: WARNING,
    appliesTo: ["table", "data-grid", "search-results", "filter-bar", "column-header"],
    rationale:
      "Users need to understand when a data view is filtered, sorted, or no longer showing the full dataset.",
    requirement:
      "Active sort and filter state must be visible and recoverable.",
    remediation:
      "Show active filter chips, sorted column indicators, result counts, and clear/reset affordances.",
    references: ["AFENDA:data-display-contract", "AFENDA:route-state-contract"],
    enforcement: MANUAL,
  },
  {
    id: "data-display.truncation-recovery",
    category: DATA_DISPLAY,
    severity: ERROR,
    appliesTo: ["table-cell", "badge", "metric", "record-name", "identifier"],
    forbidden: ["truncated identifier without full value access", "clipped amount", "clipped status label"],
    rationale:
      "Enterprise identifiers, names, amounts, and statuses must not be silently lost in dense displays.",
    requirement:
      "Important truncated data must provide access to the full value.",
    remediation:
      "Provide wrapping, title text, tooltip, detail panel, copy action, or expandable row access for full values.",
    references: ["AFENDA:data-display-contract", "AFENDA:layout-contract"],
    enforcement: HYBRID,
  },
  {
    id: "data-display.selection-state",
    category: DATA_DISPLAY,
    severity: ERROR,
    appliesTo: ["table", "data-grid", "list", "bulk-action", "checkbox"],
    rationale:
      "Bulk operations require unambiguous selected, partially selected, and total selection state.",
    requirement:
      "Selectable data displays must expose selected count, partial selection, and clear selection affordance.",
    remediation:
      "Show selected counts, indeterminate parent checkboxes, clear selection, and explicit all-results selection where supported.",
    references: ["AFENDA:data-display-contract", "WCAG:4.1.2"],
    enforcement: HYBRID,
  },
  {
    id: "data-display.data-freshness",
    category: DATA_DISPLAY,
    severity: WARNING,
    appliesTo: ["table", "data-grid", "dashboard", "report", "metric", "search-results"],
    rationale:
      "Enterprise users need to know whether displayed data is current, cached, stale, syncing, or failed to refresh.",
    requirement:
      "Data displays must expose freshness, sync, or last-updated context where data can become stale.",
    remediation:
      "Show last updated time, sync status, stale markers, refresh affordance, or error state for refresh failures.",
    references: ["AFENDA:data-display-contract", "AFENDA:observability-contract"],
    enforcement: MANUAL,
  },
  {
    id: "data-display.permission-aware-values",
    category: DATA_DISPLAY,
    severity: ERROR,
    appliesTo: ["table-cell", "detail-panel", "metric", "report", "export", "restricted-field"],
    rationale:
      "Enterprise data displays must not reveal restricted values through tables, summaries, exports, or previews.",
    requirement:
      "Restricted values must be hidden, masked, or replaced with permission-aware placeholders.",
    remediation:
      "Use permission-aware field renderers and ensure exports follow the same field visibility rules.",
    references: ["AFENDA:data-display-contract", "AFENDA:security-ui-contract", "XFORGE:permission-pipeline"],
    enforcement: HYBRID,
  },
  {
    id: "data-display.responsive-column-behavior",
    category: DATA_DISPLAY,
    severity: WARNING,
    appliesTo: ["table", "data-grid", "report", "card-list", "mobile-table"],
    rationale:
      "Data displays must remain understandable on constrained viewports without hiding critical meaning.",
    requirement:
      "Responsive data displays must define which columns persist, collapse, wrap, or move into detail views.",
    remediation:
      "Define priority columns, responsive card alternatives, horizontal containment, or detail disclosure patterns.",
    references: ["AFENDA:data-display-contract", "AFENDA:layout-contract"],
    enforcement: MANUAL,
  },
] as const satisfies readonly AfendaRuntimeRule[];
