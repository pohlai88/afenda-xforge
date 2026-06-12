import fs from "node:fs";
import path from "node:path";

const root = path.join("apps", "api", "app", "api", "hr");

const domains = {
  org: {
    readCtx: "createHrOrgReadContext",
    writeCtx: null,
    ensureRead: "ensureHrOrgReadAccess",
    ensureWrite: "ensureHrOrgWriteAccess",
    respond: "respondWithHrOrgError",
    mutationStatus: null,
  },
  compliance: {
    readCtx: "createComplianceReadContext",
    writeCtx: "createComplianceWriteContext",
    ensureRead: "ensureComplianceReadAccess",
    ensureWrite: "ensureComplianceWriteAccess",
    respond: "respondWithComplianceError",
    mutationStatus: "mutationStatusFromComplianceResult",
  },
  lifecycle: {
    readCtx: "createEmployeeLifecycleReadContext",
    writeCtx: "createEmployeeLifecycleWriteContext",
    ensureRead: "ensureEmployeeLifecycleReadAccess",
    ensureWrite: "ensureEmployeeLifecycleWriteAccess",
    respond: "respondWithEmployeeLifecycleError",
    mutationStatus: null,
  },
};

const httpImportPath = (routeDir, domainKey) => {
  const rel = path
    .relative(routeDir, path.join(root, domainKey, "_lib", "http.ts"))
    .replace(/\\/g, "/");

  return rel.startsWith(".") ? rel : `./${rel}`;
};

const wrapGet = (body, cfg) =>
  `export async function GET(request: Request): Promise<Response> {\n  try {\n    const context = await ${cfg.readCtx}(request);\n    const denied = ${cfg.ensureRead}(context);\n    if (denied) {\n      return denied;\n    }\n\n${body}\n  } catch (error) {\n    return ${cfg.respond}(error);\n  }\n}`;

const wrapPost = (body, cfg) =>
  `export async function POST(request: Request): Promise<Response> {\n  try {\n    const context = await ${cfg.writeCtx}(request);\n    const denied = ${cfg.ensureWrite}(context);\n    if (denied) {\n      return denied;\n    }\n\n${body}\n  } catch (error) {\n    return ${cfg.respond}(error);\n  }\n}`;

for (const [domain, cfg] of Object.entries(domains)) {
  const domainDir = path.join(root, domain);
  const routes = fs
    .readdirSync(domainDir, { recursive: true })
    .filter((file) => String(file).endsWith("route.ts"))
    .map((file) => path.join(domainDir, String(file)));

  for (const file of routes) {
    let source = fs.readFileSync(file, "utf8");

    if (source.includes(cfg.ensureRead)) {
      continue;
    }

    const routeDir = path.dirname(file);
    const importPath = httpImportPath(routeDir, domain);
    const importLines = [
      cfg.ensureRead,
      cfg.ensureWrite,
      cfg.respond,
      cfg.mutationStatus,
    ]
      .filter(Boolean)
      .join(",\n  ");
    const httpImports = `import {\n  ${importLines},\n} from "${importPath}";`;

    const contextImport = source.match(/from "\.\.\/_lib\/context\.ts";/);

    if (!contextImport) {
      console.log("skip missing context import", file);
      continue;
    }

    source = source.replace(
      /from "\.\.\/_lib\/context\.ts";/,
      `from "../_lib/context.ts";\n${httpImports}`
    );

    source = source.replace(
      /export async function GET\(([^)]*)\)\s*\{([\s\S]*?)\n\}/,
      (_match, _params, body) => wrapGet(body.trim(), cfg)
    );

    if (cfg.writeCtx) {
      source = source.replace(
        /export async function POST\(([^)]*)\)\s*\{([\s\S]*?)\n\}/,
        (_match, _params, body) => {
          let newBody = body.trim();

          if (cfg.mutationStatus) {
            newBody = newBody.replace(
              /return NextResponse\.json\(result, \{ status: result\.ok \? (\d+) : 400 \}\);/g,
              "return NextResponse.json(result, { status: mutationStatusFromComplianceResult(result, $1) });"
            );
            newBody = newBody.replace(
              /return NextResponse\.json\(result, \{ status: result\.ok \? 200 : 400 \}\);/g,
              "return NextResponse.json(result, { status: mutationStatusFromComplianceResult(result) });"
            );
          }

          return wrapPost(newBody, cfg);
        }
      );
    }

    fs.writeFileSync(file, source);
    console.log("updated", file);
  }
}
