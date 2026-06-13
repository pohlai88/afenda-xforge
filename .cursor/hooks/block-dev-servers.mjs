#!/usr/bin/env node
/**
 * beforeShellExecution — project-general.mdc dev/build policy.
 * Ask before starting long-running dev/start servers (port conflicts).
 */
import { emit, log, parseStdinJson } from "./_hook-utils.mjs";

const TAG = "block-dev-servers";

/** Gates and tests are safe even when they embed "dev" in paths. */
const SAFE_COMMAND =
  /\b(typecheck|lint|check:|test:|vitest|jest|knip|scorecard)\b/i;

/** Agent-initiated dev servers / watch processes. */
const DEV_OR_START =
  /\b(pnpm|npm|yarn|bun|npx)\b[\s\S]*\b(dev|start)\b|\bnext\s+dev\b|\bstorybook\s+dev\b/i;

const input = parseStdinJson();

if (input === null) {
  log(TAG, "invalid stdin JSON; allowing");
  emit({ permission: "allow" });
  process.exit(0);
}

const command = typeof input.command === "string" ? input.command : "";

if (!command || SAFE_COMMAND.test(command) || !DEV_OR_START.test(command)) {
  emit({ permission: "allow" });
  process.exit(0);
}

emit({
  permission: "ask",
  user_message:
    "This command may start a long-running dev/start server. Confirm only if you want a new server process.",
  agent_message:
    "Dev/start server blocked pending approval (project-general.mdc). The user may already have a dev server on port 3000. Prefer typecheck, check:*, or test:* gates unless they explicitly asked to start dev.",
});

process.exit(0);
