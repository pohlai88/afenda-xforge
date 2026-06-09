#!/usr/bin/env node

console.error(
  [
    "db:push is blocked in XForge.",
    "Use `pnpm --filter @repo/database db:migrate` instead.",
    "Schema changes must be captured as reviewed migrations before they reach shared environments.",
  ].join(" ")
);

process.exit(1);
