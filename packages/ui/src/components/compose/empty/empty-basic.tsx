"use client";

import { Folder } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../ui-shadcn/empty";
import { ComposePatternCard } from "../compose.pattern-shell";

export function EmptyBasic() {
  return (
    <ComposePatternCard
      title="Basic"
      description="A simple empty state for collection surfaces."
    >
      <Empty className="rounded-lg border bg-background">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Folder className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No projects yet</EmptyTitle>
          <EmptyDescription>
            Create or import a project to start attaching metadata and
            workflows.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </ComposePatternCard>
  );
}
