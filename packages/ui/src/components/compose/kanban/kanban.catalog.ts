export type KanbanPatternSpec = {
  name: string;
  title: string;
  description: string;
};

export const kanbanPatternCatalog = [
  {
    name: "default",
    title: "Kanban board",
    description: "A draggable board with sortable columns and cards.",
  },
  {
    name: "overlay",
    title: "Overlay",
    description: "The dragged item can render a custom ghost overlay.",
  },
] as const satisfies readonly KanbanPatternSpec[];

export type KanbanPatternName = (typeof kanbanPatternCatalog)[number]["name"];

export const kanbanPatternCount = kanbanPatternCatalog.length;
export const kanbanPatternNames = kanbanPatternCatalog.map(
  (pattern) => pattern.name,
) as KanbanPatternName[];
