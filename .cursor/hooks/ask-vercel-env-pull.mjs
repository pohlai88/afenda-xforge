#!/usr/bin/env node
/**
 * beforeShellExecution — vercel-deployment.mdc: ask before env pull (may overwrite .env.local).
 */
import { emit, log, parseStdinJson } from "./_hook-utils.mjs";

const TAG = "ask-vercel-env-pull";

const ENV_PULL = /\bvercel\b[\s\S]*\benv\s+pull\b/i;

const input = parseStdinJson();

if (input === null) {
  log(TAG, "invalid stdin JSON; allowing");
  emit({ permission: "allow" });
  process.exit(0);
}

const command = typeof input.command === "string" ? input.command : "";

if (!command || !ENV_PULL.test(command)) {
  emit({ permission: "allow" });
  process.exit(0);
}

emit({
  permission: "ask",
  user_message:
    "`vercel env pull` may overwrite local .env files. Confirm if you want to sync from Vercel.",
  agent_message:
    "vercel env pull blocked pending approval (vercel-deployment.mdc). Prefer pnpm env:doctor after pull. Never commit pulled secrets.",
});

process.exit(0);
