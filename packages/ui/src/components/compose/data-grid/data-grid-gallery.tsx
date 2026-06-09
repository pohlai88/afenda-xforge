"use client";

import { Badge } from "../../ui-shadcn/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";
import { dataGridPatternCatalog } from "./data-grid.catalog";
import { renderDataGridPattern } from "./data-grid.shared";

export function DataGridComposeGallery() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>Data grid patterns</CardTitle>
            <Badge variant="secondary">
              {dataGridPatternCatalog.length} variants
            </Badge>
          </div>
          <CardDescription>
            A registry view of the shipped TanStack Table data-grid patterns.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Includes layout, interaction, state, and summary patterns, all backed
          by the shared `renderDataGridPattern` catalog.
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {dataGridPatternCatalog.map((pattern) => (
          <section key={pattern.name} aria-label={pattern.title}>
            {renderDataGridPattern(pattern.name)}
          </section>
        ))}
      </div>
    </div>
  );
}
