"use client";

import { ChevronRight, GripVertical } from "lucide-react";

import {
  Sortable,
  SortableItem,
  SortableItemHandle,
  SortablePatternCard,
} from "./sortable.shared";

const sections = [
  {
    id: "colors",
    title: "Colors",
    items: ["White", "Black", "Grey", "Green"],
  },
  {
    id: "sizes",
    title: "Sizes",
    items: ["Small", "Medium", "Large"],
  },
  {
    id: "materials",
    title: "Materials",
    items: ["Cotton", "Polyester", "Wool"],
  },
] as const;

function SortableNested() {
  return (
    <SortablePatternCard
      title="Nested"
      description="A grouped nested layout that keeps each collection independently sortable."
    >
      <div className="grid gap-3">
        {sections.map((section) => (
          <div key={section.id} className="rounded-xl border bg-background p-3">
            <div className="mb-3 flex items-center gap-2">
              <ChevronRight className="size-4 text-muted-foreground" />
              <p className="text-sm font-medium">{section.title}</p>
            </div>
            <Sortable
              value={section.items}
              onValueChange={() => {
                // Static preview data; this pattern demonstrates structure only.
              }}
              getItemValue={(item) => item}
            >
              {section.items.map((item) => (
                <SortableItem key={item} value={item} className="p-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm">{item}</span>
                    <SortableItemHandle className="-me-1">
                      <GripVertical className="size-4" />
                    </SortableItemHandle>
                  </div>
                </SortableItem>
              ))}
            </Sortable>
          </div>
        ))}
      </div>
    </SortablePatternCard>
  );
}

export { SortableNested };
