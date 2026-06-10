import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const kanbanSharedPath = path.join(
  process.cwd(),
  "packages",
  "ui",
  "src",
  "components",
  "compose",
  "kanban",
  "kanban.shared.tsx"
);

test("kanban compose uses shadcn column handle and card shells", () => {
  const source = readFileSync(kanbanSharedPath, "utf8");

  assert.match(source, /<KanbanColumnHandle\s+asChild>/);
  assert.match(source, /<Card>/);
  assert.doesNotMatch(
    source,
    /<KanbanColumnHandle>\s*\n?\s*<span>/,
    "column titles must stay outside KanbanColumnHandle"
  );
});
