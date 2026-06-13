#!/usr/bin/env node
/**
 * Cursor beforeShellExecution hook: ask before destructive git on WIP.
 * Matches agent-discipline.mdc / AGENTS.md — no restore/clean unless user asked.
 */
import { readFileSync } from "node:fs";

const DESTRUCTIVE_GIT =
  /\bgit\b[\s\S]*\b(restore|checkout\s+--|clean)\b/i;

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function emit(result) {
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

const raw = readStdin();
let input = {};

try {
  input = raw ? JSON.parse(raw) : {};
} catch {
  emit({ permission: "allow" });
  process.exit(0);
}

const command = typeof input.command === "string" ? input.command : "";

if (!command || !DESTRUCTIVE_GIT.test(command)) {
  emit({ permission: "allow" });
  process.exit(0);
}

// Dry-run / help are informational
if (/\b(-n|--dry-run|--help|-h)\b/.test(command)) {
  emit({ permission: "allow" });
  process.exit(0);
}

emit({
  permission: "ask",
  user_message:
    "This git command can discard uncommitted or untracked work. Confirm only if you explicitly want that.",
  agent_message:
    "Destructive git (restore / checkout -- / clean) is blocked pending user approval. Do not retry unless the user explicitly requested discarding WIP.",
});

process.exit(0);
