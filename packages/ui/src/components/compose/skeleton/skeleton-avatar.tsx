"use client";

import { Skeleton } from "../../ui-shadcn/skeleton";
import { ComposePatternCard } from "../compose.pattern-shell";

export function SkeletonAvatar() {
  return (
    <ComposePatternCard
      title="Avatar"
      description="Avatar and profile-line placeholders for identity loading states."
    >
      <div className="flex items-center gap-3 rounded-lg border bg-background p-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    </ComposePatternCard>
  );
}
