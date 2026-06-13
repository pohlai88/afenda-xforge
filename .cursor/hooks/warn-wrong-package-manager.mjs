#!/usr/bin/env node
/**
 * beforeShellExecution — project-general.mdc: pnpm monorepo.
 */
import { emit, log, parseStdinJson } from "./_hook-utils.mjs";

const TAG = "warn-wrong-pm";

const WRONG_INSTALL =
  /\b(npm\s+(install|i)\b|yarn\s+(add|install)\b|bun\s+(add|install)\b)/i;

const input = parseStdinJson();

if (input === null) {
  log(TAG, "invalid stdin JSON; allowing");
  emit({ permission: "allow" });
  process.exit(0);
}

const command = typeof input.command === "string" ? input.command : "";

if (!command || !WRONG_INSTALL.test(command)) {
  emit({ permission: "allow" });
  process.exit(0);
}

emit({
  permission: "ask",
  user_message:
    "This repo uses pnpm (see packageManager in package.json). Confirm if you intentionally want npm/yarn/bun here.",
  agent_message:
    "Prefer pnpm install / pnpm add / pnpm --filter <pkg> <script>. Retry with pnpm unless the user explicitly chose another package manager.",
});

process.exit(0);
