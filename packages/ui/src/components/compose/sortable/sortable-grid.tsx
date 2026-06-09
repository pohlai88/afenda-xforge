"use client";

import { GripVertical, ImageIcon } from "lucide-react";

import {
  Sortable,
  SortableItem,
  SortableItemHandle,
  SortablePatternCard,
} from "./sortable.shared";

const mediaItems = [
  {
    id: "hero-image",
    title: "Hero image",
    description: "Main banner image",
    meta: "image 2.4 MB",
  },
  {
    id: "spec-sheet",
    title: "Product spec",
    description: "Technical details document",
    meta: "document 1.2 MB",
  },
  {
    id: "demo-video",
    title: "Demo video",
    description: "How the product works",
    meta: "video 15.7 MB",
  },
  {
    id: "audio-guide",
    title: "Audio guide",
    description: "Voice instructions",
    meta: "audio 8.3 MB",
  },
] as const;

function SortableGrid() {
  return (
    <SortablePatternCard
      title="Grid"
      description="A compact media grid with drag handles aligned for tile reordering."
    >
      <Sortable
        layout="grid"
        value={mediaItems}
        onValueChange={() => {
          // Static preview data; this pattern demonstrates structure only.
        }}
        getItemValue={(item) => item.id}
      >
        {mediaItems.map((item) => (
          <SortableItem key={item.id} value={item.id} className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-2">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <ImageIcon className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.meta}
                  </p>
                </div>
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

export { SortableGrid };
