#!/usr/bin/env node
/**
 * Cursor stop hook: run `pnpm --filter app check:stability` when the agent
 * touched apps/app/, and return failures as followup_message for self-healing.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const APP_SCOPE = "apps/app";
const STABILITY_CMD = "pnpm --filter app check:stability";
const MAX_OUTPUT_CHARS = 8000;

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function runGit(args, cwd) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  });

  if (result.error) {
    return { ok: false, stdout: "", stderr: String(result.error) };
  }

  return {
    ok: result.status === 0,
    stdout: (result.stdout ?? "").trim(),
    stderr: (result.stderr ?? "").trim(),
  };
}

function resolveRepoRoot() {
  const fromGit = runGit(["rev-parse", "--show-toplevel"], process.cwd());

  if (fromGit.ok && fromGit.stdout) {
    return fromGit.stdout;
  }

  return process.cwd();
}

function appScopeChanged(repoRoot) {
  const status = runGit(["status", "--porcelain", "--", APP_SCOPE], repoRoot);

  if (!status.ok) {
    log(`git status failed: ${status.stderr || "unknown error"}`);
    return false;
  }

  return status.stdout.length > 0;
}

function truncate(text) {
  if (text.length <= MAX_OUTPUT_CHARS) {
    return text;
  }

  const omitted = text.length - MAX_OUTPUT_CHARS;
  return `${text.slice(0, MAX_OUTPUT_CHARS)}\n\n… [truncated ${omitted} chars]`;
}

function log(message) {
  process.stderr.write(`[stop-app-stability] ${message}\n`);
}

function emit(result) {
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

function runStability(repoRoot) {
  return spawnSync(STABILITY_CMD, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
    env: process.env,
  });
}

const raw = readStdin();
let input = {};

try {
  input = raw ? JSON.parse(raw) : {};
} catch {
  log("invalid stdin JSON; skipping");
  emit({});
  process.exit(0);
}

const status = input.status ?? "completed";
const loopCount = typeof input.loop_count === "number" ? input.loop_count : 0;

if (status !== "completed") {
  log(`status=${status}; skipping stability gate`);
  emit({});
  process.exit(0);
}

const repoRoot = resolveRepoRoot();

if (!appScopeChanged(repoRoot)) {
  log("no apps/app changes; skipping");
  emit({});
  process.exit(0);
}

log(`apps/app changed; running check:stability (loop ${loopCount})`);

const result = runStability(repoRoot);
const combined = truncate(
  [result.stdout ?? "", result.stderr ?? ""]
    .filter(Boolean)
    .join("\n")
    .trim() || `check:stability exited with code ${result.status ?? "unknown"}`
);

if (result.status === 0 && !result.error) {
  log("check:stability passed");
  emit({});
  process.exit(0);
}

const exitCode = result.status ?? 1;
const errorNote = result.error
  ? `\n\nSpawn error: ${result.error.message}`
  : "";

log(`check:stability failed (exit ${exitCode})`);

emit({
  followup_message: [
    "App stability check failed after your last turn. Fix the issues below, then stop — the hook will re-run automatically.",
    "",
    `Command: ${STABILITY_CMD}`,
    `Exit code: ${exitCode}`,
    "",
    combined + errorNote,
  ].join("\n"),
});

process.exit(0);
