#!/usr/bin/env node
/**
 * beforeShellExecution — vercel-deployment.mdc: ask before production deploy/promote.
 */
import { emit, log, parseStdinJson } from "./_hook-utils.mjs";

const TAG = "ask-vercel-production";

const PRODUCTION_DEPLOY =
  /\bvercel\b[\s\S]*(?:--prod(?:uction)?|\bpromote\b)/i;

const SAFE_VERCEL =
  /\bvercel\b[\s\S]*\b(env\s+(pull|ls|list|add|rm|remove)|link|login|logout|whoami|inspect|logs|dev)\b/i;

const input = parseStdinJson();

if (input === null) {
  log(TAG, "invalid stdin JSON; allowing");
  emit({ permission: "allow" });
  process.exit(0);
}

const command = typeof input.command === "string" ? input.command : "";

if (!command || SAFE_VERCEL.test(command) || !PRODUCTION_DEPLOY.test(command)) {
  emit({ permission: "allow" });
  process.exit(0);
}

emit({
  permission: "ask",
  user_message:
    "This command may deploy or promote to Vercel production. Confirm only if intentional.",
  agent_message:
    "Production Vercel action blocked pending approval (vercel-deployment.mdc). Run typecheck + check:stability + build locally first. Ensure Production env vars and database are correct — preview must not use prod credentials.",
});

process.exit(0);
