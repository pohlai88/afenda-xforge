import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

type DeclarationSnapshot = {
  files: Record<string, string>;
};

const packageRoot = resolve(import.meta.dirname, "..");
const distRoot = join(packageRoot, "dist");
const snapshotsRoot = join(packageRoot, "snapshots");
const snapshotPath = join(snapshotsRoot, "declaration-snapshot.json");

const getDeclarationFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return getDeclarationFiles(fullPath);
    }

    return entry.isFile() && entry.name.endsWith(".d.ts") ? [fullPath] : [];
  });

const hashContent = (content: string): string =>
  createHash("sha256").update(content).digest("hex");

const snapshot: DeclarationSnapshot = {
  files: Object.fromEntries(
    getDeclarationFiles(distRoot)
      .sort()
      .map((filePath) => {
        const relativePath = relative(packageRoot, filePath).replaceAll(
          "\\",
          "/"
        );
        const content = readFileSync(filePath, "utf8");

        return [relativePath, hashContent(content)];
      })
  ),
};

mkdirSync(snapshotsRoot, { recursive: true });
writeFileSync(
  `${snapshotPath}`,
  `${JSON.stringify(snapshot, null, 2)}\n`,
  "utf8"
);

console.log(`updated ${relative(packageRoot, snapshotPath)}`);
