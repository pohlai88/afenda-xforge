#!/usr/bin/env node
/**
 * preToolUse — vercel-deployment.mdc: NEXT_PUBLIC_* must not carry secrets.
 */
import { emit, log, parseStdinJson } from "./_hook-utils.mjs";

const TAG = "guard-next-public-env";

const EDIT_TOOLS = new Set([
  "Write",
  "StrReplace",
  "Delete",
  "EditNotebook",
  "ApplyPatch",
]);

const ENV_PATH = /(?:^|[/\\])\.env(?:\.|$)|\.env\.example$/i;

/** Safe public key fragments (Supabase anon/publishable, app URLs). */
const ALLOWED_KEY_FRAGMENTS = [
  "PUBLISHABLE",
  "ANON",
  "_URL",
  "APP_URL",
  "WEB_URL",
  "API_URL",
  "DOCS_URL",
];

const FORBIDDEN_KEY_FRAGMENTS = [
  "SECRET",
  "PASSWORD",
  "PRIVATE",
  "SERVICE_ROLE",
  "DATABASE",
  "POSTGRES",
  "CONNECTION",
  "JWT",
  "SESSION",
  "SIGNING",
  "STRIPE_SK",
  "API_KEY",
  "ACCESS_TOKEN",
  "REFRESH_TOKEN",
];

const FORBIDDEN_VALUE_PATTERNS = [
  /\bsk_live_[a-zA-Z0-9]+\b/,
  /\bsk_test_[a-zA-Z0-9]+\b/,
  /\bpostgresql:\/\//i,
  /\bmongodb(\+srv)?:\/\//i,
  /\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\./, // JWT-shaped
];

function extractPath(input) {
  const toolInput = input.tool_input ?? input.arguments ?? input.input ?? {};
  const candidates = [
    toolInput.path,
    toolInput.file_path,
    input.path,
    input.file_path,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.length > 0) {
      return value.replace(/\\/g, "/");
    }
  }

  return "";
}

function extractContent(input) {
  const toolInput = input.tool_input ?? input.arguments ?? input.input ?? {};
  const candidates = [
    toolInput.contents,
    toolInput.new_string,
    toolInput.content,
    toolInput.text,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return "";
}

function scanEnvContent(content) {
  const violations = [];

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^(NEXT_PUBLIC_[A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    const suffix = key.replace(/^NEXT_PUBLIC_/, "");

    const allowed = ALLOWED_KEY_FRAGMENTS.some((fragment) =>
      suffix.includes(fragment)
    );

    if (!allowed) {
      for (const fragment of FORBIDDEN_KEY_FRAGMENTS) {
        if (suffix.includes(fragment)) {
          violations.push(`${key} (forbidden key name — use server-only env)`);
          break;
        }
      }
    }

    const value = rawValue.replace(/^["']|["']$/g, "");
    for (const pattern of FORBIDDEN_VALUE_PATTERNS) {
      if (pattern.test(value)) {
        violations.push(`${key} (value looks like a secret — server-only env)`);
        break;
      }
    }
  }

  return violations;
}

const input = parseStdinJson();

if (input === null) {
  log(TAG, "invalid stdin JSON; allowing");
  emit({ permission: "allow" });
  process.exit(0);
}

const toolName = input.tool_name ?? input.toolName ?? "";

if (toolName && !EDIT_TOOLS.has(toolName)) {
  emit({ permission: "allow" });
  process.exit(0);
}

const path = extractPath(input);

if (!path || !ENV_PATH.test(path)) {
  emit({ permission: "allow" });
  process.exit(0);
}

const content = extractContent(input);

if (!content) {
  emit({ permission: "allow" });
  process.exit(0);
}

const violations = scanEnvContent(content);

if (violations.length === 0) {
  emit({ permission: "allow" });
  process.exit(0);
}

log(TAG, `flagged ${path}: ${violations.join("; ")}`);

emit({
  permission: "ask",
  user_message: `Env edit may expose secrets via NEXT_PUBLIC_* (${path}). Approve only if values are truly browser-safe.`,
  agent_message: `NEXT_PUBLIC_* violation (vercel-deployment.mdc): ${violations.join("; ")}. Move secrets to server-only env vars. Hook: guard-next-public-env.mjs.`,
});

process.exit(0);
