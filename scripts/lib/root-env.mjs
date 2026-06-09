#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const stripWrappingQuotes = (value) => {
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")))
  ) {
    return value.slice(1, -1);
  }

  return value;
};

export const parseEnvFile = (filePath) => {
  const env = {};
  const contents = fs.readFileSync(filePath, "utf8");

  for (const line of contents.split(/\r?\n/u)) {
    const trimmedLine = line.trim();

    if (!(trimmedLine && !trimmedLine.startsWith("#"))) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();

    env[key] = stripWrappingQuotes(rawValue);
  }

  return env;
};

export const resolveRootEnvFile = (rootDirectory) => {
  const candidates = [".env.local", ".env"];

  for (const candidate of candidates) {
    const candidatePath = path.join(rootDirectory, candidate);

    if (fs.existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  return null;
};

export const loadRootEnv = (rootDirectory) => {
  const envFile = resolveRootEnvFile(rootDirectory);

  if (!envFile) {
    throw new Error(
      `Missing root environment file. Expected ${path.join(rootDirectory, ".env.local")} or ${path.join(rootDirectory, ".env")}`
    );
  }

  return {
    env: parseEnvFile(envFile),
    envFile,
  };
};
