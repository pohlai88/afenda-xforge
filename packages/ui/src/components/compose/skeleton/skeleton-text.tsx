"use client";

import { Skeleton } from "../../ui-shadcn/skeleton";
import { ComposePatternCard } from "../compose.pattern-shell";

export function SkeletonText() {
  return (
    <ComposePatternCard
      title="Text"
      description="Text placeholder lines for compact loading states."
    >
      <div className="space-y-3 rounded-lg border bg-background p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </ComposePatternCard>
  );
}
