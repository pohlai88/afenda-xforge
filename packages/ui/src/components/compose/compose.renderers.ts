import { accordionPatternCatalog } from "./accordion/accordion.catalog";
import { alertPatternCatalog } from "./alert/alert.catalog";
import { alertDialogPatternCatalog } from "./alert-dialog/alert-dialog.catalog";
import { aspectRatioPatternCatalog } from "./aspect-ratio/aspect-ratio.catalog";
import { autocompletePatternCatalog } from "./autocomplete/autocomplete.catalog";
import { badgePatternCatalog } from "./badge/badge.catalog";
import { breadcrumbPatternCatalog } from "./breadcrumb/breadcrumb.catalog";
import { buttonPatternCatalog } from "./button/button.catalog";
import { buttonGroupPatternCatalog } from "./button-group/button-group.catalog";
import { cardPatternCatalog } from "./card/card.catalog";
import { checkboxPatternCatalog } from "./checkbox/checkbox.catalog";
import { collapsiblePatternCatalog } from "./collapsible/collapsible.catalog";
import { comboboxPatternCatalog } from "./combobox/combobox.catalog";
import type { ComposeRenderablePatternSpec } from "./compose.contract";
import type { ComposeRegistryGroupName } from "./compose.registry";
import { getComposeRegistryGroup } from "./compose.registry";
import { DataGridBasic } from "./data-grid/data-grid-basic";
import { DataGridCrud } from "./data-grid/data-grid-crud";
import { DataGridDenseTable } from "./data-grid/data-grid-dense-table";
import { DataGridRowSelection } from "./data-grid/data-grid-row-selection";
import { DataGridSortableColumns } from "./data-grid/data-grid-sortable-columns";
import { dateSelectorPatternCatalog } from "./date-selector/date-selector.catalog";
import { fileUploadPatternCatalog } from "./file-upload/file-upload.catalog";
import { filtersPatternCatalog } from "./filters/filters.catalog";
import { framePatternCatalog } from "./frame/frame.catalog";
import { KanbanDefault } from "./kanban/kanban-default";
import { KanbanOverlayPattern } from "./kanban/kanban-overlay";
import { lineChartPatternCatalog } from "./line-chart/line-chart.catalog";
import { numberFieldPatternCatalog } from "./number-field/number-field.catalog";
import { phoneInputPatternCatalog } from "./phone-input/phone-input.catalog";
import { ratingPatternCatalog } from "./rating/rating.catalog";
import { scrollspyPatternCatalog } from "./scrollspy/scrollspy.catalog";
import { sortablePatternCatalog } from "./sortable/sortable.catalog";
import { spinnerPatternCatalog } from "./spinner/spinner.catalog";
import { statisticCardPatternCatalog } from "./statistic-card/statistic-card.catalog";
import { stepperPatternCatalog } from "./stepper/stepper.catalog";
import { tabsPatternCatalog } from "./tabs/tabs.catalog";
import { timelinePatternCatalog } from "./timeline/timeline.catalog";
import { treePatternCatalog } from "./tree/tree.catalog";

function createRenderableCatalog(
  groupName: ComposeRegistryGroupName,
  catalog: readonly ComposeRenderablePatternSpec[],
): readonly ComposeRenderablePatternSpec[] {
  const registryGroup = getComposeRegistryGroup(groupName);

  if (!registryGroup) {
    throw new Error(`Unknown compose registry group: ${groupName}`);
  }

  if (registryGroup.readiness !== "metadata-ready") {
    throw new Error(
      `Renderable compose catalog '${groupName}' must only target metadata-ready groups.`,
    );
  }

  const catalogEntries = new Map(
    catalog.map((pattern) => [pattern.name, pattern] as const),
  );

  return registryGroup.patterns.map((registryPattern) => {
    const renderablePattern = catalogEntries.get(registryPattern.name);

    if (!renderablePattern) {
      throw new Error(
        `Missing renderable compose pattern '${registryPattern.name}' for group '${groupName}'.`,
      );
    }

    return renderablePattern;
  });
}

const dataGridRenderableCatalog = [
  {
    name: "basic",
    title: "Basic",
    description: "A basic metadata table.",
    component: DataGridBasic,
  },
  {
    name: "dense-table",
    title: "Dense Table",
    description: "A compact table for operational data.",
    component: DataGridDenseTable,
  },
  {
    name: "row-selection",
    title: "Row Selection",
    description: "A selectable collection table.",
    component: DataGridRowSelection,
  },
  {
    name: "sortable-columns",
    title: "Sortable Columns",
    description: "A table with sortable columns.",
    component: DataGridSortableColumns,
  },
  {
    name: "crud",
    title: "CRUD",
    description: "A collection surface with row actions.",
    component: DataGridCrud,
  },
] as const satisfies readonly ComposeRenderablePatternSpec[];

const kanbanRenderableCatalog = [
  {
    name: "default",
    title: "Default",
    description: "A grouped workflow board.",
    component: KanbanDefault,
  },
  {
    name: "overlay",
    title: "Overlay",
    description: "A board with drag overlay behavior.",
    component: KanbanOverlayPattern,
  },
] as const satisfies readonly ComposeRenderablePatternSpec[];

export const composeRenderableCatalogs = {
  accordion: createRenderableCatalog("accordion", accordionPatternCatalog),
  alert: createRenderableCatalog("alert", alertPatternCatalog),
  "alert-dialog": createRenderableCatalog(
    "alert-dialog",
    alertDialogPatternCatalog,
  ),
  "aspect-ratio": createRenderableCatalog(
    "aspect-ratio",
    aspectRatioPatternCatalog,
  ),
  autocomplete: createRenderableCatalog(
    "autocomplete",
    autocompletePatternCatalog,
  ),
  badge: createRenderableCatalog("badge", badgePatternCatalog),
  breadcrumb: createRenderableCatalog("breadcrumb", breadcrumbPatternCatalog),
  button: createRenderableCatalog("button", buttonPatternCatalog),
  "button-group": createRenderableCatalog(
    "button-group",
    buttonGroupPatternCatalog,
  ),
  card: createRenderableCatalog("card", cardPatternCatalog),
  checkbox: createRenderableCatalog("checkbox", checkboxPatternCatalog),
  collapsible: createRenderableCatalog(
    "collapsible",
    collapsiblePatternCatalog,
  ),
  combobox: createRenderableCatalog("combobox", comboboxPatternCatalog),
  "data-grid": createRenderableCatalog("data-grid", dataGridRenderableCatalog),
  "date-selector": createRenderableCatalog(
    "date-selector",
    dateSelectorPatternCatalog,
  ),
  "file-upload": createRenderableCatalog(
    "file-upload",
    fileUploadPatternCatalog,
  ),
  filters: createRenderableCatalog("filters", filtersPatternCatalog),
  frame: createRenderableCatalog("frame", framePatternCatalog),
  kanban: createRenderableCatalog("kanban", kanbanRenderableCatalog),
  "line-chart": createRenderableCatalog("line-chart", lineChartPatternCatalog),
  "number-field": createRenderableCatalog(
    "number-field",
    numberFieldPatternCatalog,
  ),
  "phone-input": createRenderableCatalog(
    "phone-input",
    phoneInputPatternCatalog,
  ),
  rating: createRenderableCatalog("rating", ratingPatternCatalog),
  scrollspy: createRenderableCatalog("scrollspy", scrollspyPatternCatalog),
  sortable: createRenderableCatalog("sortable", sortablePatternCatalog),
  spinner: createRenderableCatalog("spinner", spinnerPatternCatalog),
  "statistic-card": createRenderableCatalog(
    "statistic-card",
    statisticCardPatternCatalog,
  ),
  stepper: createRenderableCatalog("stepper", stepperPatternCatalog),
  tabs: createRenderableCatalog("tabs", tabsPatternCatalog),
  timeline: createRenderableCatalog("timeline", timelinePatternCatalog),
  tree: createRenderableCatalog("tree", treePatternCatalog),
} as const satisfies Partial<
  Record<ComposeRegistryGroupName, readonly ComposeRenderablePatternSpec[]>
>;

export type ComposeRenderableGroupName = keyof typeof composeRenderableCatalogs;

export const composeRenderableGroupNames = Object.keys(
  composeRenderableCatalogs,
) as ComposeRenderableGroupName[];

export function getComposeRenderablePatterns(
  groupName: ComposeRenderableGroupName,
): (typeof composeRenderableCatalogs)[ComposeRenderableGroupName] {
  return composeRenderableCatalogs[groupName];
}

export function getComposeRenderablePattern(
  groupName: ComposeRenderableGroupName,
  patternName: string,
): ComposeRenderablePatternSpec | undefined {
  return composeRenderableCatalogs[groupName].find(
    (pattern) => pattern.name === patternName,
  );
}
