"use client";

import { Skeleton } from "../../ui-shadcn/skeleton";
import { ComposePatternCard } from "../compose.pattern-shell";

export function SkeletonTable() {
  return (
    <ComposePatternCard
      title="Table"
      description="A tabular loading placeholder for dense operational collections."
    >
      <div className="overflow-hidden rounded-lg border bg-background">
        <div className="grid grid-cols-4 gap-4 border-b p-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-3 p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="grid grid-cols-4 gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>
    </ComposePatternCard>
  );
}
