import type {
  ComposePatternSpec,
  ComposeRegistryGroup,
} from "./compose.contract";

function pattern(
  name: string,
  title: string,
  description: string,
): ComposePatternSpec {
  return { name, title, description };
}

function group<const T extends ComposeRegistryGroup>(input: T): T {
  return input;
}

export const composeRegistryGroups = [
  group({
    name: "accordion",
    title: "Accordions",
    description:
      "Disclosure patterns for grouped details and progressive sections.",
    kind: "interaction",
    metadataRoles: ["section", "state"],
    capabilities: ["controlled"],
    readiness: "metadata-ready",
    patterns: [
      pattern(
        "basic-single-expand",
        "Basic Single Expand",
        "Single-open disclosure content.",
      ),
      pattern(
        "borders-rounded",
        "Bordered Rounded",
        "Grouped disclosure rows with visible boundaries.",
      ),
      pattern(
        "nested-bordered-items",
        "Nested Bordered Items",
        "Hierarchical disclosure content.",
      ),
      pattern(
        "onboarding-steps",
        "Onboarding Steps",
        "Progressive setup sections.",
      ),
    ],
  }),
  group({
    name: "alert",
    title: "Alerts",
    description:
      "Generic feedback states for status, warning, and action prompts.",
    kind: "feedback",
    metadataRoles: ["feedback", "state"],
    capabilities: ["empty-state", "loading-state"],
    readiness: "metadata-ready",
    patterns: [
      pattern("info", "Info", "Neutral informational feedback."),
      pattern("success", "Success", "Successful state feedback."),
      pattern("warning", "Warning", "Warning state feedback."),
      pattern(
        "destructive",
        "Destructive",
        "Error or destructive state feedback.",
      ),
      pattern("inline", "Inline", "Inline feedback for compact surfaces."),
      pattern(
        "dismissible",
        "Dismissible",
        "Feedback with an explicit dismissal affordance.",
      ),
    ],
  }),
  group({
    name: "alert-dialog",
    title: "Alert Dialogs",
    description:
      "Guarded confirmation flows for destructive or interruptive actions.",
    kind: "feedback",
    metadataRoles: ["action", "feedback", "state"],
    capabilities: ["controlled", "form", "validation"],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic", "Basic", "A standard confirmation dialog."),
      pattern(
        "destructive-confirmation",
        "Destructive Confirmation",
        "A destructive action confirmation.",
      ),
      pattern(
        "unsaved-changes",
        "Unsaved Changes",
        "A leave-confirmation dialog.",
      ),
      pattern(
        "consent-checkbox",
        "Consent Checkbox",
        "A confirmation requiring explicit consent.",
      ),
      pattern("form-entry", "Form Entry", "A confirmation flow with fields."),
    ],
  }),
  group({
    name: "aspect-ratio",
    title: "Aspect Ratios",
    description: "Stable media frames for metadata assets and previews.",
    kind: "layout",
    metadataRoles: ["layout", "visualization"],
    capabilities: ["density"],
    readiness: "metadata-ready",
    patterns: [
      pattern("square", "Square", "A 1:1 media frame."),
      pattern("standard", "Standard", "A 4:3 media frame."),
      pattern("widescreen", "Widescreen", "A 16:9 media frame."),
      pattern("portrait", "Portrait", "A vertical media frame."),
    ],
  }),
  group({
    name: "autocomplete",
    title: "Autocomplete",
    description: "Searchable selection patterns for metadata-backed fields.",
    kind: "data-entry",
    metadataRoles: ["field"],
    capabilities: ["async", "controlled", "filtering", "form"],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic", "Basic", "A searchable single-select field."),
      pattern(
        "async-search",
        "Async Search",
        "A searchable field backed by async results.",
      ),
      pattern(
        "with-clear-button",
        "Clear Button",
        "A selection field with explicit clear action.",
      ),
      pattern("with-groups", "Groups", "Grouped search results."),
      pattern("form", "Form", "Autocomplete inside a validated form context."),
    ],
  }),
  group({
    name: "avatar",
    title: "Avatars",
    description: "People and identity display presets.",
    kind: "data-display",
    metadataRoles: ["state", "section"],
    capabilities: ["summary"],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic", "Basic", "A basic user avatar."),
      pattern("basic-group", "Basic Group", "A compact group of avatars."),
      pattern(
        "online-status",
        "Online Status",
        "Avatar with presence indicator.",
      ),
      pattern(
        "user-details-badge",
        "User Details Badge",
        "Identity summary with status metadata.",
      ),
    ],
  }),
  group({
    name: "badge",
    title: "Badges",
    description: "Compact labels for status, counts, and metadata attributes.",
    kind: "data-display",
    metadataRoles: ["feedback", "state"],
    capabilities: ["summary"],
    readiness: "metadata-ready",
    patterns: [
      pattern("secondary", "Secondary", "A neutral metadata badge."),
      pattern("success", "Success", "A success state badge."),
      pattern("warning", "Warning", "A warning state badge."),
      pattern(
        "destructive",
        "Destructive",
        "A destructive or error state badge.",
      ),
      pattern("with-dot", "With Dot", "A badge with a compact status dot."),
      pattern("with-icon", "With Icon", "A badge with an icon cue."),
    ],
  }),
  group({
    name: "breadcrumb",
    title: "Breadcrumbs",
    description: "Hierarchy navigation for metadata detail pages.",
    kind: "navigation",
    metadataRoles: ["navigation", "section"],
    capabilities: [],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic", "Basic", "A standard hierarchy trail."),
      pattern("home-icon", "Home Icon", "A trail with a home affordance."),
      pattern(
        "ellipsis-long-paths",
        "Ellipsis Long Paths",
        "A trail that compresses deep paths.",
      ),
      pattern(
        "dropdown-menu",
        "Dropdown Menu",
        "A trail with collapsed path selection.",
      ),
    ],
  }),
  group({
    name: "button",
    title: "Buttons",
    description: "Action presets for metadata-rendered commands.",
    kind: "action",
    metadataRoles: ["action"],
    capabilities: ["loading-state"],
    readiness: "metadata-ready",
    patterns: [
      pattern("with-icon", "With Icon", "A standard icon action."),
      pattern("icon-only", "Icon Only", "A compact toolbar action."),
      pattern("loading", "Loading", "An action with pending state."),
      pattern("destructive", "Destructive", "A destructive action."),
      pattern("full-width", "Full Width", "A block action for forms."),
    ],
  }),
  group({
    name: "button-group",
    title: "Button Groups",
    description: "Grouped command and segmented control patterns.",
    kind: "action",
    metadataRoles: ["action", "navigation"],
    capabilities: ["controlled", "filtering", "pagination"],
    readiness: "metadata-ready",
    patterns: [
      pattern(
        "basic-two-buttons",
        "Basic Two Buttons",
        "A simple grouped action pair.",
      ),
      pattern("pagination", "Pagination", "Pagination controls."),
      pattern("view-switcher", "View Switcher", "A segmented view selector."),
      pattern(
        "toolbar-filter-sort-more",
        "Toolbar Filter Sort More",
        "A dense toolbar command group.",
      ),
    ],
  }),
  group({
    name: "card",
    title: "Cards",
    description:
      "Content containers for entity summaries, sections, and metrics.",
    kind: "layout",
    metadataRoles: ["section", "metric"],
    capabilities: ["summary"],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic", "Basic", "A neutral section card."),
      pattern(
        "header-footer",
        "Header Footer",
        "A card with header and footer regions.",
      ),
      pattern(
        "header-badge-actions",
        "Header Badge Actions",
        "A card with status and actions.",
      ),
      pattern(
        "stat-trend-overflow",
        "Stat Trend Overflow",
        "A metric card with trend and overflow actions.",
      ),
    ],
  }),
  group({
    name: "chart",
    title: "Charts",
    description: "Visualization presets for metrics and trend data.",
    kind: "visualization",
    metadataRoles: ["metric", "visualization"],
    capabilities: ["summary"],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic-bar", "Basic Bar", "A basic bar chart."),
      pattern("vertical-bar", "Vertical Bar", "A vertical bar chart."),
      pattern(
        "donut-center-total",
        "Donut Center Total",
        "A donut chart with central total.",
      ),
      pattern(
        "multi-dataset-bar",
        "Multi Dataset Bar",
        "A grouped dataset bar chart.",
      ),
    ],
  }),
  group({
    name: "checkbox",
    title: "Checkboxes",
    description: "Boolean and multi-select field patterns.",
    kind: "data-entry",
    metadataRoles: ["field"],
    capabilities: ["controlled", "form", "selection", "validation"],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic-label", "Basic Label", "A checkbox with label."),
      pattern(
        "label-description",
        "Label Description",
        "A checkbox with helper text.",
      ),
      pattern("group", "Group", "A checkbox group."),
      pattern(
        "card-group",
        "Card Group",
        "Selectable cards backed by checkboxes.",
      ),
      pattern("invalid", "Invalid", "A checkbox validation state."),
    ],
  }),
  group({
    name: "collapsible",
    title: "Collapsible",
    description: "Expandable panels and compact disclosure controls.",
    kind: "interaction",
    metadataRoles: ["section", "state"],
    capabilities: ["controlled"],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic", "Basic", "A simple collapsible region."),
      pattern("form-fields", "Form Fields", "A collapsible form section."),
      pattern(
        "multi-level-menu",
        "Multi Level Menu",
        "Nested collapsible navigation.",
      ),
      pattern(
        "checkbox-settings",
        "Checkbox Settings",
        "A collapsible settings group.",
      ),
    ],
  }),
  group({
    name: "combobox",
    title: "Comboboxes",
    description: "Rich selection patterns for metadata fields.",
    kind: "data-entry",
    metadataRoles: ["field"],
    capabilities: [
      "async",
      "controlled",
      "filtering",
      "form",
      "selection",
      "validation",
    ],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic", "Basic", "A searchable selection field."),
      pattern("multi-select", "Multi Select", "A multi-value selection field."),
      pattern("with-groups", "Groups", "Grouped selection results."),
      pattern("popup", "Popup", "A combobox rendered inside a popup panel."),
      pattern("invalid", "Invalid", "A combobox validation state."),
      pattern("form", "Form", "A combobox inside a form."),
    ],
  }),
  group({
    name: "command",
    title: "Command",
    description:
      "Search-first action surfaces for navigation and quick execution.",
    kind: "navigation",
    metadataRoles: ["action", "navigation"],
    capabilities: ["controlled", "filtering", "selection"],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic", "Basic", "A basic command surface for quick lookup."),
      pattern("groups", "Groups", "Command items grouped by functional area."),
      pattern(
        "shortcuts",
        "Shortcuts",
        "Command items with keyboard shortcut labels.",
      ),
      pattern(
        "dialog",
        "Dialog",
        "A modal command palette for global actions.",
      ),
    ],
  }),
  group({
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
    patterns: [
      pattern("basic", "Basic", "A basic metadata table."),
      pattern(
        "dense-table",
        "Dense Table",
        "A compact table for operational data.",
      ),
      pattern(
        "row-selection",
        "Row Selection",
        "A selectable collection table.",
      ),
      pattern(
        "sortable-columns",
        "Sortable Columns",
        "A table with sortable columns.",
      ),
      pattern("crud", "CRUD", "A collection surface with row actions."),
    ],
  }),
  group({
    name: "date-selector",
    title: "Date Selectors",
    description: "Date input compositions for forms and filters.",
    kind: "data-entry",
    metadataRoles: ["field"],
    capabilities: ["controlled", "filtering", "form", "validation"],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic", "Basic", "A basic date selector."),
      pattern("popover", "Popover", "A date selector inside a popover."),
      pattern(
        "dropdown-menu",
        "Dropdown Menu",
        "A date selector inside a menu.",
      ),
      pattern("dialog", "Dialog", "A date selector inside a dialog."),
    ],
  }),
  group({
    name: "dropdown-menu",
    title: "Dropdown Menus",
    description:
      "Compact action menus for row tools, settings, and context actions.",
    kind: "action",
    metadataRoles: ["action", "navigation"],
    capabilities: ["controlled", "selection"],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic", "Basic", "A standard dropdown menu."),
      pattern(
        "checkboxes",
        "Checkboxes",
        "A dropdown menu with multi-select toggles.",
      ),
      pattern(
        "radio-group",
        "Radio Group",
        "A dropdown menu with single-choice options.",
      ),
      pattern(
        "destructive",
        "Destructive",
        "A dropdown menu with destructive actions.",
      ),
    ],
  }),
  group({
    name: "empty",
    title: "Empty States",
    description:
      "Designed empty states for collections, workflows, and onboarding gaps.",
    kind: "feedback",
    metadataRoles: ["feedback", "section", "state"],
    capabilities: ["empty-state", "summary"],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic", "Basic", "A simple empty state."),
      pattern(
        "actions",
        "Actions",
        "An empty state with primary and secondary actions.",
      ),
      pattern(
        "avatar",
        "Avatar",
        "An empty state framed by collaborator identity.",
      ),
      pattern(
        "input-group",
        "Input Group",
        "An empty state with inline input capture.",
      ),
    ],
  }),
  group({
    name: "field",
    title: "Fields",
    description:
      "Labeled field compositions for forms, settings, and metadata sections.",
    kind: "data-entry",
    metadataRoles: ["field", "section"],
    capabilities: ["form", "validation"],
    readiness: "metadata-ready",
    patterns: [
      pattern("input", "Input", "A standard labeled input field layout."),
      pattern(
        "checkbox",
        "Checkbox",
        "A horizontal field for binary settings.",
      ),
      pattern(
        "responsive",
        "Responsive",
        "A field layout that adapts between stacked and inline modes.",
      ),
      pattern(
        "group",
        "Group",
        "A grouped form section with subsection separation.",
      ),
    ],
  }),
  group({
    name: "file-upload",
    title: "File Upload",
    description: "Upload inputs for attachment fields and document workflows.",
    kind: "data-entry",
    metadataRoles: ["field"],
    capabilities: ["controlled", "form", "validation"],
    readiness: "metadata-ready",
    patterns: [
      pattern("default", "Default", "A single-file upload field."),
      pattern("avatar", "Avatar", "A compact avatar upload field."),
      pattern("image-grid", "Image Grid", "A multi-image upload field."),
      pattern(
        "progress",
        "Progress",
        "An upload field with progress treatment.",
      ),
      pattern("table", "Table", "A document upload table."),
    ],
  }),
  group({
    name: "filters",
    title: "Filters",
    description: "Filter bars and query controls for metadata collections.",
    kind: "interaction",
    metadataRoles: ["collection"],
    capabilities: ["controlled", "filtering", "validation"],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic", "Basic", "A basic filter bar."),
      pattern("trigger-button", "Trigger Button", "A compact filter trigger."),
      pattern("data-grid", "Data Grid", "Filters paired with data grid state."),
      pattern("validation", "Validation", "Filters with validation treatment."),
    ],
  }),
  group({
    name: "frame",
    title: "Frames",
    description:
      "Section shells for metadata panels, forms, and detail regions.",
    kind: "layout",
    metadataRoles: ["layout", "section"],
    capabilities: ["density"],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic", "Basic", "A neutral section frame."),
      pattern("dense-panels", "Dense Panels", "Dense operational panels."),
      pattern(
        "separated-panels",
        "Separated Panels",
        "Panels with visible separation.",
      ),
      pattern("stacked-panels", "Stacked Panels", "Stacked section frames."),
    ],
  }),
  group({
    name: "input-group",
    title: "Input Groups",
    description:
      "Structured inputs with inline addons, controls, and block-level helpers.",
    kind: "data-entry",
    metadataRoles: ["field"],
    capabilities: ["controlled", "form", "validation"],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic", "Basic", "A basic input group for text entry."),
      pattern(
        "with-icon",
        "With Icon",
        "An input group with a leading icon addon.",
      ),
      pattern(
        "with-button",
        "With Button",
        "An input group with a trailing action button.",
      ),
      pattern(
        "block-start",
        "Block Start",
        "An input group with a block-level header addon.",
      ),
    ],
  }),
  group({
    name: "kanban",
    title: "Kanban",
    description: "State-grouped collection views for workflow metadata.",
    kind: "data-display",
    metadataRoles: ["collection", "state"],
    capabilities: ["drag-and-drop", "summary"],
    readiness: "metadata-ready",
    patterns: [
      pattern("default", "Default", "A grouped workflow board."),
      pattern("overlay", "Overlay", "A board with drag overlay behavior."),
    ],
  }),
  group({
    name: "line-chart",
    title: "Line Charts",
    description: "Trend visualizations for metadata-backed metrics.",
    kind: "visualization",
    metadataRoles: ["metric", "visualization"],
    capabilities: ["summary"],
    readiness: "metadata-ready",
    patterns: [
      pattern("line-chart-1", "Line Chart 1", "A basic line chart preset."),
      pattern("line-chart-2", "Line Chart 2", "A compact line chart preset."),
      pattern(
        "line-chart-3",
        "Line Chart 3",
        "A comparative line chart preset.",
      ),
    ],
  }),
  group({
    name: "number-field",
    title: "Number Fields",
    description: "Numeric field patterns for forms, filters, and quantities.",
    kind: "data-entry",
    metadataRoles: ["field"],
    capabilities: ["controlled", "form", "validation"],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic", "Basic", "A basic number field."),
      pattern("size", "Size", "A number field size scale."),
      pattern(
        "extended-message",
        "Extended Message",
        "A number field with helper or validation text.",
      ),
      pattern(
        "with-action-buttons",
        "Action Buttons",
        "A number field with increment or action controls.",
      ),
    ],
  }),
  group({
    name: "phone-input",
    title: "Phone Inputs",
    description: "Phone number entry patterns for contact metadata.",
    kind: "data-entry",
    metadataRoles: ["field"],
    capabilities: ["controlled", "form", "validation"],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic", "Basic", "A basic phone input."),
      pattern("size", "Size", "A phone input size scale."),
      pattern(
        "validation",
        "Validation",
        "A phone input with validation treatment.",
      ),
    ],
  }),
  group({
    name: "rating",
    title: "Ratings",
    description: "Rating inputs and readonly rating displays.",
    kind: "data-entry",
    metadataRoles: ["field", "metric"],
    capabilities: ["controlled", "form"],
    readiness: "metadata-ready",
    patterns: [
      pattern("editable", "Editable", "An editable rating input."),
      pattern("show-value", "Show Value", "A rating display with value text."),
      pattern("decimal", "Decimal", "A rating display with decimal precision."),
      pattern("size", "Size", "A rating size scale."),
    ],
  }),
  group({
    name: "scrollspy",
    title: "Scrollspy",
    description: "Navigation affordances for long metadata detail pages.",
    kind: "navigation",
    metadataRoles: ["navigation", "section"],
    capabilities: [],
    readiness: "metadata-ready",
    patterns: [
      pattern("horizontal", "Horizontal", "Horizontal section navigation."),
      pattern("vertical", "Vertical", "Vertical section navigation."),
    ],
  }),
  group({
    name: "sheet",
    title: "Sheets",
    description:
      "Context panels for secondary flows, navigation, and review tasks.",
    kind: "layout",
    metadataRoles: ["action", "section", "state"],
    capabilities: ["controlled", "form"],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic", "Basic", "A standard side sheet."),
      pattern("left", "Left", "A left-side sheet for supporting context."),
      pattern(
        "no-close-button",
        "No Close Button",
        "A sheet that relies on explicit footer actions.",
      ),
      pattern("top", "Top", "A top sheet for compact summary content."),
    ],
  }),
  group({
    name: "skeleton",
    title: "Skeletons",
    description:
      "Loading placeholders for text, cards, tables, and identity surfaces.",
    kind: "feedback",
    metadataRoles: ["feedback", "section", "state"],
    capabilities: ["loading-state"],
    readiness: "metadata-ready",
    patterns: [
      pattern("text", "Text", "Text line loading placeholders."),
      pattern("avatar", "Avatar", "Profile loading placeholders."),
      pattern("card", "Card", "Card loading placeholders."),
      pattern("table", "Table", "Table loading placeholders."),
    ],
  }),
  group({
    name: "sortable",
    title: "Sortable",
    description:
      "Reorderable lists and grids for ordered metadata collections.",
    kind: "interaction",
    metadataRoles: ["collection"],
    capabilities: ["controlled", "drag-and-drop"],
    readiness: "metadata-ready",
    patterns: [
      pattern("default", "Default", "A reorderable list."),
      pattern("grid", "Grid", "A reorderable grid."),
      pattern("nested", "Nested", "A nested reorderable collection."),
    ],
  }),
  group({
    name: "spinner",
    title: "Spinners",
    description: "Loading indicators for fields, cards, and full-page states.",
    kind: "feedback",
    metadataRoles: ["feedback", "state"],
    capabilities: ["loading-state"],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic", "Basic", "A basic loading spinner."),
      pattern(
        "button-loading",
        "Button Loading",
        "A spinner treatment for buttons.",
      ),
      pattern(
        "inline-loading-text",
        "Inline Loading Text",
        "Inline loading text with spinner.",
      ),
      pattern("overlay", "Overlay", "An overlay loading state."),
    ],
  }),
  group({
    name: "statistic-card",
    title: "Statistic Cards",
    description:
      "Metric summaries for dashboards and metadata overview panels.",
    kind: "data-display",
    metadataRoles: ["metric", "section"],
    capabilities: ["summary"],
    readiness: "metadata-ready",
    patterns: [
      pattern(
        "statistic-card-1",
        "Statistic Card 1",
        "A primary metric summary.",
      ),
      pattern(
        "statistic-card-2",
        "Statistic Card 2",
        "A compact metric summary.",
      ),
      pattern(
        "statistic-card-3",
        "Statistic Card 3",
        "A metric summary with supporting context.",
      ),
    ],
  }),
  group({
    name: "stepper",
    title: "Steppers",
    description: "Multi-step workflow and process indicators.",
    kind: "navigation",
    metadataRoles: ["navigation", "state"],
    capabilities: ["controlled"],
    readiness: "metadata-ready",
    patterns: [
      pattern("default", "Default", "A standard stepper."),
      pattern("controlled", "Controlled", "A controlled stepper."),
      pattern("vertical", "Vertical", "A vertical process stepper."),
      pattern("progress", "Progress", "A stepper with progress treatment."),
    ],
  }),
  group({
    name: "tabs",
    title: "Tabs",
    description: "View switching and grouped content navigation.",
    kind: "navigation",
    metadataRoles: ["navigation", "section"],
    capabilities: ["controlled", "density"],
    readiness: "metadata-ready",
    patterns: [
      pattern("default", "Default", "A standard tab list."),
      pattern("line", "Line", "A line-style tab list."),
      pattern("pill", "Pill", "A pill-style tab list."),
      pattern("vertical", "Vertical", "A vertical tab layout."),
      pattern("badge", "Badge", "Tabs with count or status badges."),
    ],
  }),
  group({
    name: "timeline",
    title: "Timelines",
    description: "Chronological and process-oriented event displays.",
    kind: "data-display",
    metadataRoles: ["collection", "section", "state"],
    capabilities: ["summary"],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic", "Basic", "A basic timeline."),
      pattern("activity-feed", "Activity Feed", "A feed-style event timeline."),
      pattern("pipeline-steps", "Pipeline Steps", "A process timeline."),
      pattern(
        "left-aligned-dates",
        "Left Aligned Dates",
        "A dated event timeline.",
      ),
    ],
  }),
  group({
    name: "tree",
    title: "Trees",
    description: "Hierarchical collections and nested navigation surfaces.",
    kind: "data-display",
    metadataRoles: ["collection", "navigation"],
    capabilities: ["controlled", "selection"],
    readiness: "metadata-ready",
    patterns: [
      pattern("basic", "Basic", "A basic tree."),
      pattern(
        "indented-lines",
        "Indented Lines",
        "A tree with visible hierarchy lines.",
      ),
      pattern("file-explorer", "File Explorer", "A file-like hierarchy tree."),
      pattern(
        "permissions",
        "Permissions",
        "A tree with selectable permissions.",
      ),
    ],
  }),
  group({
    name: "workspace",
    title: "Workspace",
    description:
      "Application chrome for ERP shells: app topbar, sidebar rail, context switchers, and site content regions.",
    kind: "layout",
    metadataRoles: ["layout", "navigation", "section"],
    capabilities: ["controlled", "density"],
    readiness: "preview-only",
    patterns: [
      pattern(
        "full-shell",
        "Full Shell",
        "Complete workspace assembly with sidebar and site column.",
      ),
      pattern(
        "app-nav-topbar",
        "App Nav Topbar",
        "Tenant context breadcrumb switchers.",
      ),
      pattern(
        "sidebar-rail",
        "Sidebar Rail",
        "Module navigation with user footer.",
      ),
      pattern(
        "context-switchers",
        "Context Switchers",
        "Organization, department, team, and project switchers.",
      ),
      pattern(
        "site-chrome",
        "Site Chrome",
        "Site topbar and scrollable content canvas.",
      ),
    ],
  }),
] as const satisfies readonly ComposeRegistryGroup[];

export type ComposeRegistryGroupName =
  (typeof composeRegistryGroups)[number]["name"];

export const composeRegistryGroupNames = composeRegistryGroups.map(
  (registryGroup) => registryGroup.name,
) as ComposeRegistryGroupName[];

export const composeRegistryPatternCount = composeRegistryGroups.reduce(
  (total, registryGroup) => total + registryGroup.patterns.length,
  0,
);

export function getComposeRegistryGroup(
  name: ComposeRegistryGroupName,
): (typeof composeRegistryGroups)[number] | undefined {
  return composeRegistryGroups.find(
    (registryGroup) => registryGroup.name === name,
  );
}

export function getComposeRegistryPattern(
  groupName: ComposeRegistryGroupName,
  patternName: string,
): ComposePatternSpec | undefined {
  return getComposeRegistryGroup(groupName)?.patterns.find(
    (registryPattern) => registryPattern.name === patternName,
  );
}
