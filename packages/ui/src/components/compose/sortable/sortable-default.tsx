"use client";

import { GripVertical } from "lucide-react";

import {
  Sortable,
  SortableItem,
  SortableItemHandle,
  SortablePatternCard,
} from "./sortable.shared";

const tasks = [
  {
    id: "design-system",
    title: "Design system",
    description: "Tune tokens and shared primitives first.",
  },
  {
    id: "product-copy",
    title: "Product copy",
    description: "Rewrite the onboarding and empty states.",
  },
  {
    id: "qa-pass",
    title: "QA pass",
    description: "Verify the drag interactions and keyboard flow.",
  },
] as const;

function SortableDefault() {
  return (
    <SortablePatternCard
      title="Default"
      description="A standard vertical sortable list for reordering related items."
    >
      <Sortable
        value={tasks}
        onValueChange={() => {
          // Static preview data; this pattern demonstrates structure only.
        }}
        getItemValue={(item) => item.id}
      >
        {tasks.map((item) => (
          <SortableItem key={item.id} value={item.id} className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <SortableItemHandle className="-me-1">
                <GripVertical className="size-4" />
              </SortableItemHandle>
            </div>
          </SortableItem>
        ))}
      </Sortable>
    </SortablePatternCard>
  );
}

export { SortableDefault };
