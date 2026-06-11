import fs from "node:fs";
import path from "node:path";

const appDir = path.resolve(import.meta.dirname, "../app");

const appComponentImports = [
  "authenticated-feature-scope",
  "metadata-feature-shell",
  "authenticated-shell",
  "tenant-branding-context",
  "tenant-branding-draft-scope",
  "workspace/workspace-frame",
];

function dots(count) {
  return "../".repeat(count);
}

function segmentsFromApp(filePath) {
  const rel = path.relative(appDir, path.dirname(filePath));

  if (rel === "") {
    return 0;
  }

  return rel.split(path.sep).length;
}

function rewriteImport(content, pattern, replacement) {
  return content.replace(pattern, replacement);
}

function fixFile(full) {
  let content = fs.readFileSync(full, "utf8");
  const depth = segmentsFromApp(full);
  const toApp = dots(depth);
  const toAppLib = dots(depth + 1);

  content = rewriteImport(
    content,
    /from (["'])(\.\.\/)+_lib\//g,
    `from $1${toApp}_lib/`
  );
  content = rewriteImport(
    content,
    /from (["'])(\.\.\/)+_runtime-access\.ts/g,
    `from $1${toApp}_runtime-access.ts`
  );

  for (const modulePath of appComponentImports) {
    const escaped = modulePath.replace(/\//g, "\\/");
    content = rewriteImport(
      content,
      new RegExp(`from (["'])(\\.\\.\\/)+_components\\/${escaped}`, "g"),
      `from $1${toApp}_components/${modulePath}`
    );
  }

  content = rewriteImport(
    content,
    /from (["'])(\.\.\/)+lib\//g,
    `from $1${toAppLib}lib/`
  );

  if (full.includes(`${path.sep}(authenticated)${path.sep}`)) {
    const authenticatedDir = path.join(appDir, "[locale]", "(authenticated)");
    const depthInAuthenticated = path.relative(
      authenticatedDir,
      path.dirname(full)
    );
    const segments =
      depthInAuthenticated === ""
        ? 0
        : depthInAuthenticated.split(path.sep).length;
    const toAuthenticatedComponents = dots(segments + 1);

    content = rewriteImport(
      content,
      /from (["'])(\.\.\/)+_components\/dashboard-grid\.tsx/g,
      `from $1${toAuthenticatedComponents}_components/dashboard-grid.tsx`
    );
    content = rewriteImport(
      content,
      /from (["'])(\.\.\/)+_components\/status-badge\.tsx/g,
      `from $1${toAuthenticatedComponents}_components/status-badge.tsx`
    );
  }

  if (full.includes(`${path.sep}theme-studio${path.sep}`)) {
    const themeStudioDir = path.join(appDir, "[locale]", "theme-studio");
    const depthInThemeStudio = path.relative(
      themeStudioDir,
      path.dirname(full)
    );
    const segments =
      depthInThemeStudio === "" ? 0 : depthInThemeStudio.split(path.sep).length;
    const toThemeStudioComponents = dots(segments + 1);

    content = rewriteImport(
      content,
      /from (["'])(\.\.\/)+_components\/([^"']+)/g,
      `from $1${toThemeStudioComponents}_components/$3`
    );
  }

  fs.writeFileSync(full, content);
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);

    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (/\.(tsx?)$/.test(name)) {
      fixFile(full);
    }
  }
}

walk(path.join(appDir, "[locale]"));
console.log("Fixed locale import paths.");
