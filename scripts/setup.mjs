#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const skipInstall = process.argv.includes("--skip-install");

const BLUE = "\x1b[34m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

function info(message) {
  console.log(`${BLUE}i ${message}${RESET}`);
}

function success(message) {
  console.log(`${GREEN}✓ ${message}${RESET}`);
}

function warn(message) {
  console.log(`${YELLOW}! ${message}${RESET}`);
}

function fail(message) {
  console.error(`${RED}x ${message}${RESET}`);
  process.exit(1);
}

function getCommandOutput(command) {
  try {
    return execSync(command, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function run(command) {
  execSync(command, { cwd: root, stdio: "inherit" });
}

function checkNode() {
  const major = Number.parseInt(process.versions.node.split(".")[0], 10);
  if (major < 20) {
    fail(`Node.js >= 20 is required. Current version: ${process.version}`);
  }

  success(`Node.js ${process.version}`);
}

function checkPnpm() {
  const version = getCommandOutput("pnpm --version");
  if (!version) {
    fail("pnpm is required for this workspace.");
  }

  const major = Number.parseInt(version.split(".")[0], 10);
  if (major < 10) {
    fail(`pnpm >= 10 is required. Current version: ${version}`);
  }

  success(`pnpm ${version}`);
}

function shouldSkipDir(name) {
  return (
    name === "node_modules" ||
    name === ".git" ||
    name === ".next" ||
    name === "dist" ||
    name === ".turbo" ||
    name === ".cache"
  );
}

function collectEnvExamples(dir, matches = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!shouldSkipDir(entry.name)) {
        collectEnvExamples(fullPath, matches);
      }
      continue;
    }

    if (entry.name === ".env.example") {
      matches.push(fullPath);
    }
  }

  return matches;
}

function getEnvTargetPath(envExamplePath) {
  const relativeDir = path.relative(root, path.dirname(envExamplePath));
  const [workspaceType] = relativeDir.split(path.sep);
  const targetFile = workspaceType === "apps" ? ".env.local" : ".env";

  return path.join(path.dirname(envExamplePath), targetFile);
}

function ensureEnvFiles() {
  const envExamples = collectEnvExamples(root);
  let created = 0;

  for (const envExamplePath of envExamples) {
    const envPath = getEnvTargetPath(envExamplePath);
    const relativeEnvPath = path.relative(root, envPath) || ".env";

    if (fs.existsSync(envPath)) {
      info(`${relativeEnvPath} already exists`);
      continue;
    }

    fs.copyFileSync(envExamplePath, envPath);
    success(`Created ${relativeEnvPath}`);
    created += 1;
  }

  if (created === 0) {
    info("No new .env files were created");
  }
}

function main() {
  console.log("");
  console.log(`${BLUE}=== XForge workspace setup ===${RESET}`);
  console.log("");

  info("Checking runtime prerequisites...");
  checkNode();
  checkPnpm();

  if (skipInstall) {
    warn("Skipping pnpm install");
  } else {
    info("Installing workspace dependencies...");
    run("pnpm install");
    success("Dependencies installed");
  }

  info("Copying missing environment templates...");
  ensureEnvFiles();

  console.log("");
  console.log(`${GREEN}Setup baseline complete.${RESET}`);
  console.log("");
  console.log("Next steps:");
  console.log(
    "1. Fill in package-owned .env files, especially database and auth."
  );
  console.log(
    "2. Run database generation or migration tasks from packages/database."
  );
  console.log("3. Start the workspace with `pnpm dev`.");
  console.log(
    "4. Verify the first feature through the canonical query/execution path."
  );
  console.log("");
}

main();
