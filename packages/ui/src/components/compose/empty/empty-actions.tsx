"use client";

import { ArrowUpRight, Folder } from "lucide-react";

import { Button } from "../../ui-shadcn/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../ui-shadcn/empty";
import { ComposePatternCard } from "../compose.pattern-shell";

export function EmptyActions() {
  return (
    <ComposePatternCard
      title="Actions"
      description="An empty state with primary and secondary actions."
    >
      <Empty className="rounded-lg border bg-background">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Folder className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No projects yet</EmptyTitle>
          <EmptyDescription>
            Start from scratch or import an existing repository.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <Button>Create project</Button>
            <Button variant="outline">Import project</Button>
          </div>
          <Button variant="link" className="text-muted-foreground">
            Learn more
            <ArrowUpRight className="size-4" />
          </Button>
        </EmptyContent>
      </Empty>
    </ComposePatternCard>
  );
}
