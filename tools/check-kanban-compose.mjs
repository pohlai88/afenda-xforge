#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const kanbanComposeRoot = path.join(
  root,
  "packages",
  "ui",
  "src",
  "components",
  "compose",
  "kanban"
);

function collectTsxFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory)) {
    const absolutePath = path.join(directory, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      files.push(...collectTsxFiles(absolutePath));
      continue;
    }

    if (absolutePath.endsWith(".tsx")) {
      files.push(absolutePath);
    }
  }

  return files;
}

function validateKanbanColumnHandleUsage(source, filePath) {
  const errors = [];
  const handlePattern = /<KanbanColumnHandle\b([^>]*)>/g;

  for (const match of source.matchAll(handlePattern)) {
    const attributes = match[1] ?? "";

    if (!/\basChild\b/.test(attributes)) {
      errors.push(
        `${filePath}: KanbanColumnHandle must use asChild with a grip Button — the handle is opacity-0 until column hover and must not wrap column titles`
      );
    }
  }

  if (source.includes("KanbanColumnHandle") && !source.includes("<Card")) {
    errors.push(
      `${filePath}: Kanban compose must wrap columns in Card — otherwise board chrome and tokens never render in Storybook`
    );
  }

  if (source.includes("KanbanItem") && !source.includes("<Card")) {
    errors.push(
      `${filePath}: Kanban compose must wrap items in Card — KanbanItem is a sortable shell, not a styled card`
    );
  }

  return errors;
}

function main() {
  if (!statSync(kanbanComposeRoot).isDirectory()) {
    console.log("Kanban compose gate skipped: directory not found.");
    return;
  }

  const files = collectTsxFiles(kanbanComposeRoot);
  const errors = files.flatMap((filePath) =>
    validateKanbanColumnHandleUsage(readFileSync(filePath, "utf8"), filePath)
  );

  if (errors.length > 0) {
    console.error("Kanban compose gate failed:\n");
    for (const error of errors) {
      console.error(`  • ${error}`);
    }
    process.exit(1);
  }

  console.log(`Kanban compose gate passed (${files.length} files).`);
}

main();
