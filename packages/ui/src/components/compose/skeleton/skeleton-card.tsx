"use client";

import { Card, CardContent, CardHeader } from "../../ui-shadcn/card";
import { Skeleton } from "../../ui-shadcn/skeleton";
import { ComposePatternCard } from "../compose.pattern-shell";

export function SkeletonCardPattern() {
  return (
    <ComposePatternCard
      title="Card"
      description="A card placeholder for dashboard and summary surfaces."
    >
      <Card className="max-w-xs">
        <CardHeader className="space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="aspect-video w-full" />
        </CardContent>
      </Card>
    </ComposePatternCard>
  );
}
