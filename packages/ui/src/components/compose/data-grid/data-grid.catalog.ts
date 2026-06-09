export type DataGridPatternSpec = {
  name: string;
  title: string;
  description: string;
};

export const dataGridPatternCatalog = [
  {
    name: "basic",
    title: "Basic data grid",
    description:
      "A clean table surface with pagination, sorting, and row metrics.",
  },
  {
    name: "cell-border",
    title: "Cell border",
    description: "Vertical borders make each column easier to scan.",
  },
  {
    name: "dense-table",
    title: "Dense table",
    description: "Tighter spacing helps larger grids stay compact.",
  },
  {
    name: "light-table",
    title: "Light table",
    description:
      "A softer surface with less chrome and lighter header treatment.",
  },
  {
    name: "striped-table",
    title: "Striped table",
    description: "Zebra striping improves row tracking.",
  },
  {
    name: "auto-width",
    title: "Auto width",
    description:
      "Content determines the width when the table uses auto layout.",
  },
  {
    name: "row-selection",
    title: "Row selection",
    description:
      "Selection checkboxes pair with row-level actions and summaries.",
  },
  {
    name: "expandable-row",
    title: "Expandable row",
    description: "Nested rows surface detail without leaving the table.",
  },
  {
    name: "sub-data-grid",
    title: "Sub data grid",
    description:
      "A parent table can introduce a compact nested grid for detail.",
  },
  {
    name: "column-icons",
    title: "Column icons",
    description: "Icons help clarify meaning in dense header rows.",
  },
  {
    name: "sortable-columns",
    title: "Sortable columns",
    description: "Each header exposes an explicit sort affordance.",
  },
  {
    name: "movable-columns",
    title: "Movable columns",
    description:
      "A drag-handle treatment makes column movement feel intentional.",
  },
  {
    name: "draggable-columns",
    title: "Draggable columns",
    description:
      "Drag handles and pinned column menus work together in one header row.",
  },
  {
    name: "draggable-rows",
    title: "Draggable rows",
    description: "Row handles emphasize reorderable records.",
  },
  {
    name: "resizable-columns",
    title: "Resizable columns",
    description:
      "Fixed-width columns create the right mental model for resizing.",
  },
  {
    name: "pinnable-columns",
    title: "Pinnable columns",
    description:
      "Pinning keeps important fields anchored while the table scrolls.",
  },
  {
    name: "sticky-header",
    title: "Sticky header",
    description: "The header remains visible while the body scrolls.",
  },
  {
    name: "column-controls",
    title: "Column controls",
    description:
      "Visibility and filter controls sit above the grid when the surface gets busy.",
  },
  {
    name: "card-container",
    title: "Card container",
    description: "The table can sit inside a card frame for denser dashboards.",
  },
  {
    name: "column-visibility",
    title: "Column visibility",
    description: "The grid can hide and reveal columns from a single control.",
  },
  {
    name: "loading-skeleton",
    title: "Loading skeleton",
    description: "Skeleton rows keep the layout stable while data is loading.",
  },
  {
    name: "crud",
    title: "CRUD",
    description: "Toolbar actions and row menus make the table feel editable.",
  },
  {
    name: "crud-in-frame",
    title: "CRUD in frame",
    description:
      "The same controls feel calmer when they live inside a larger frame.",
  },
  {
    name: "footer-totals",
    title: "Footer totals",
    description: "Footer cells can hold arithmetic summaries.",
  },
  {
    name: "footer-summary",
    title: "Footer summary",
    description: "A single summary row keeps the footer concise and readable.",
  },
  {
    name: "footer-aggregates",
    title: "Footer aggregates",
    description:
      "Aggregate status counts are useful in operational dashboards.",
  },
  {
    name: "infinite-scroll-local",
    title: "Infinite scroll (local)",
    description:
      "Virtualized rows keep the list fast even when more data is appended.",
  },
  {
    name: "infinite-scroll-remote",
    title: "Infinite scroll (remote)",
    description: "A loading footer can represent the next page request.",
  },
  {
    name: "row-pinning",
    title: "Row pinning",
    description:
      "Pinned rows keep important records anchored at the top of the list.",
  },
] as const satisfies readonly DataGridPatternSpec[];

export type DataGridPatternName =
  (typeof dataGridPatternCatalog)[number]["name"];

export const dataGridPatternCount = dataGridPatternCatalog.length;
export const dataGridPatternNames = dataGridPatternCatalog.map(
  (pattern) => pattern.name,
) as DataGridPatternName[];
