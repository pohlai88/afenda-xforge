import fs from "node:fs";
import path from "node:path";

const root = path.join("apps", "api", "app", "api", "hr");

const fixDuplicateContext = (source, readCtx, writeCtx) => {
  let next = source;

  next = next.replace(
    new RegExp(`await ${readCtx}\\(request\\)`, "g"),
    (match, offset, full) => {
      const before = full.slice(Math.max(0, offset - 80), offset);
      if (before.includes(`const context = await ${readCtx}`)) {
        return "context";
      }

      return match;
    }
  );

  if (writeCtx) {
    next = next.replace(
      new RegExp(`await ${writeCtx}\\(request\\)`, "g"),
      (match, offset, full) => {
        const before = full.slice(Math.max(0, offset - 80), offset);
        if (before.includes(`const context = await ${writeCtx}`)) {
          return "context";
        }

        return match;
      }
    );
  }

  return next;
};

const domains = [
  {
    dir: "compliance",
    readCtx: "createComplianceReadContext",
    writeCtx: "createComplianceWriteContext",
  },
  {
    dir: "lifecycle",
    readCtx: "createEmployeeLifecycleReadContext",
    writeCtx: "createEmployeeLifecycleWriteContext",
  },
];

for (const domain of domains) {
  const domainDir = path.join(root, domain.dir);
  const routes = fs
    .readdirSync(domainDir, { recursive: true })
    .filter((file) => String(file).endsWith("route.ts"))
    .map((file) => path.join(domainDir, String(file)));

  for (const file of routes) {
    const source = fs.readFileSync(file, "utf8");
    const fixed = fixDuplicateContext(source, domain.readCtx, domain.writeCtx);

    if (fixed !== source) {
      fs.writeFileSync(file, fixed);
      console.log("fixed duplicates", file);
    }
  }
}

const orgRoutes = fs
  .readdirSync(path.join(root, "org"), { recursive: true })
  .filter((file) => String(file).endsWith("route.ts"))
  .map((file) => path.join(root, "org", String(file)));

for (const file of orgRoutes) {
  let source = fs.readFileSync(file, "utf8");

  if (!source.includes("try {") && source.includes("ensureHrOrgReadAccess")) {
    source = source.replace(
      /export async function GET\(([^)]*)\): Promise<Response> \{\n([\s\S]*?)\n\}/,
      (_match, params, body) => {
        const trimmed = body
          .replace(/await createHrOrgReadContext\(request\)/g, "context")
          .trim();

        return `export async function GET(${params}): Promise<Response> {\n  try {\n    const context = await createHrOrgReadContext(request);\n    const denied = ensureHrOrgReadAccess(context);\n    if (denied) {\n      return denied;\n    }\n\n    ${trimmed.replace(/^const context = await createHrOrgReadContext\(request\);\n\s*/m, "")}\n  } catch (error) {\n    return respondWithHrOrgError(error);\n  }\n}`;
      }
    );

    fs.writeFileSync(file, source);
    console.log("wrapped org", file);
  }
}
