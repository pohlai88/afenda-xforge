/**
 * Shared helpers for afenda-Xforge Cursor hooks.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

export const MAX_OUTPUT_CHARS = 8000;

export function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

export function parseStdinJson() {
  const raw = readStdin();
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function emit(result) {
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

export function log(tag, message) {
  process.stderr.write(`[${tag}] ${message}\n`);
}

export function runGit(args, cwd) {
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

export function resolveRepoRoot(cwd = process.cwd()) {
  const fromGit = runGit(["rev-parse", "--show-toplevel"], cwd);

  if (fromGit.ok && fromGit.stdout) {
    return fromGit.stdout;
  }

  return cwd;
}

export function scopeChanged(repoRoot, scopePath) {
  const status = runGit(["status", "--porcelain", "--", scopePath], repoRoot);

  if (!status.ok) {
    return false;
  }

  return status.stdout.length > 0;
}

export function truncate(text, max = MAX_OUTPUT_CHARS) {
  if (text.length <= max) {
    return text;
  }

  const omitted = text.length - max;
  return `${text.slice(0, max)}\n\n… [truncated ${omitted} chars]`;
}

export function runShell(command, repoRoot) {
  return spawnSync(command, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
    env: process.env,
  });
}
