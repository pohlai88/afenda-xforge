"use client";

import { Badge } from "../../ui-shadcn/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";
import { kanbanPatternCatalog } from "./kanban.catalog";
import { renderKanbanPattern } from "./kanban.shared";

export function KanbanComposeGallery() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>Kanban patterns</CardTitle>
            <Badge variant="secondary">
              {kanbanPatternCatalog.length} variants
            </Badge>
          </div>
          <CardDescription>
            A compact registry view of the shipped Kanban compose patterns.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          The local compose surface currently ships two patterns: the default
          board and the overlay preview.
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {kanbanPatternCatalog.map((pattern) => (
          <section key={pattern.name} aria-label={pattern.title}>
            {renderKanbanPattern(pattern.name)}
          </section>
        ))}
      </div>
    </div>
  );
}
