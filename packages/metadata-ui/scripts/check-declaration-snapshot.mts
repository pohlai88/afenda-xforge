import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

type DeclarationSnapshot = {
  files: Record<string, string>;
};

const packageRoot = resolve(import.meta.dirname, "..");
const distRoot = join(packageRoot, "dist");
const snapshotPath = join(
  packageRoot,
  "snapshots",
  "declaration-snapshot.json"
);

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

const createSnapshot = (): DeclarationSnapshot => {
  if (!existsSync(distRoot)) {
    throw new Error("dist output is missing. Run the package build first.");
  }

  const files = Object.fromEntries(
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
  );

  return { files };
};

const actualSnapshot = createSnapshot();

if (!existsSync(snapshotPath)) {
  console.error(
    "metadata-ui declaration snapshot is missing. Generate it with `pnpm --filter @repo/metadata-ui update:declaration-snapshot`."
  );
  process.exit(1);
}

const expectedSnapshot = JSON.parse(
  readFileSync(snapshotPath, "utf8")
) as DeclarationSnapshot;

const actualJson = JSON.stringify(actualSnapshot, null, 2);
const expectedJson = JSON.stringify(expectedSnapshot, null, 2);

if (actualJson !== expectedJson) {
  console.error("metadata-ui declaration snapshot drift detected.");
  console.error(
    "Review the public API change, then refresh the snapshot with `pnpm --filter @repo/metadata-ui update:declaration-snapshot`."
  );
  process.exit(1);
}

console.log("metadata-ui declaration snapshot matches");
