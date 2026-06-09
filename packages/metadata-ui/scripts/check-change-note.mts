import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const packageRoot = resolve(import.meta.dirname, "..");
const repoRoot = resolve(packageRoot, "..", "..");
const snapshotPath = "packages/metadata-ui/snapshots/declaration-snapshot.json";
const changeNotePath = "packages/metadata-ui/changes/metadata-ui.md";

function runGit(args: readonly string[]): string {
  try {
    return execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function listChangedFiles(args: readonly string[]): readonly string[] {
  const output = runGit(args);

  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

function hasGitRevision(revision: string): boolean {
  return Boolean(runGit(["rev-parse", "--verify", revision]));
}

const diffTargets = [snapshotPath, changeNotePath];
const changedFiles = new Set<string>();

for (const filePath of listChangedFiles([
  "diff",
  "--name-only",
  "--",
  ...diffTargets,
])) {
  changedFiles.add(filePath);
}

for (const filePath of listChangedFiles([
  "diff",
  "--cached",
  "--name-only",
  "--",
  ...diffTargets,
])) {
  changedFiles.add(filePath);
}

if (hasGitRevision("HEAD^")) {
  for (const filePath of listChangedFiles([
    "diff",
    "--name-only",
    "HEAD^",
    "HEAD",
    "--",
    ...diffTargets,
  ])) {
    changedFiles.add(filePath);
  }
}

const githubBaseRef = process.env.GITHUB_BASE_REF;

if (githubBaseRef && hasGitRevision(`origin/${githubBaseRef}`)) {
  const mergeBase = runGit(["merge-base", "HEAD", `origin/${githubBaseRef}`]);

  if (mergeBase) {
    for (const filePath of listChangedFiles([
      "diff",
      "--name-only",
      mergeBase,
      "HEAD",
      "--",
      ...diffTargets,
    ])) {
      changedFiles.add(filePath);
    }
  }
}

if (!existsSync(join(repoRoot, changeNotePath))) {
  console.error("metadata-ui change note file is missing.");
  process.exit(1);
}

const snapshotChanged = changedFiles.has(snapshotPath);
const changeNoteChanged = changedFiles.has(changeNotePath);

if (snapshotChanged && !changeNoteChanged) {
  console.error(
    "metadata-ui public API snapshot changed without a matching change note update."
  );
  console.error(`Update ${changeNotePath} in the same change set.`);
  process.exit(1);
}

console.log("metadata-ui change-note checks passed");
