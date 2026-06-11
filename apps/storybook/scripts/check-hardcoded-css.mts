/**
 * Detect hardcoded colors in Storybook surfaces and UI components they render.
 * Semantic tokens live in packages/ui globals.css — TS/TSX should prefer var(--token).
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const storybookRoot = join(import.meta.dirname, "..");
const repoRoot = join(storybookRoot, "../..");

const runSelfTestOnly = process.argv.includes("--self-test");
const skipSelfTest = process.argv.includes("--skip-self-test");

type ScanRoot = {
  label: string;
  path: string;
  severity: "error" | "warn";
};

const scanRoots: ScanRoot[] = [
  { label: "storybook/.storybook", path: join(storybookRoot, ".storybook"), severity: "error" },
  { label: "storybook/stories", path: join(storybookRoot, "stories"), severity: "error" },
  {
    label: "ui/compose",
    path: join(repoRoot, "packages/ui/src/components/compose"),
    severity: "warn",
  },
  {
    label: "ui/shadcn",
    path: join(repoRoot, "packages/ui/src/components/ui-shadcn"),
    severity: "warn",
  },
  {
    label: "metadata-ui",
    path: join(repoRoot, "packages/metadata-ui/src"),
    severity: "warn",
  },
];

const rules = [
  {
    id: "hex-color",
    pattern: /#[0-9a-fA-F]{3,8}\b/g,
    message: "hardcoded hex color",
  },
  {
    id: "rgb-color",
    pattern: /\brgb\s*\(/g,
    message: "hardcoded rgb() color",
  },
  {
    id: "hsl-color",
    pattern: /\bhsl\s*\(\s*(?!var\(--)/g,
    message: "hardcoded hsl() color",
  },
  {
    id: "oklch-literal",
    pattern: /\boklch\s*\(\s*[\d.]/g,
    message: "hardcoded oklch() literal — use var(--token) from globals.css",
  },
  {
    id: "tailwind-palette",
    pattern: /(?:bg|border|text|ring|fill|stroke)-(gray|slate|zinc|neutral|stone|red|green|blue|amber|teal|emerald|violet|purple|pink|orange|yellow)-/g,
    message: "Tailwind palette utility — use semantic token utilities",
  },
] as const;

const lineAllowPatterns: RegExp[] = [
  /recharts-.*#ccc|#fff.*recharts/i,
  /stop-color="#/,
  /fill:\s*"#fff"/,
  /Submitted PR #\d+/,
  /\/\/ hardcoded-css-allow/,
  /\/\* hardcoded-css-allow \*\//,
];

function scanLine(line: string, severity: "error" | "warn"): Finding[] {
  if (lineAllowPatterns.some((pattern) => pattern.test(line))) {
    return [];
  }

  const lineFindings: Finding[] = [];

  for (const rule of rules) {
    rule.pattern.lastIndex = 0;
    if (rule.pattern.test(line)) {
      lineFindings.push({
        file: "<probe>",
        line: 0,
        message: rule.message,
        severity,
        snippet: line.trim().slice(0, 120),
      });
    }
  }

  return lineFindings;
}

function collectSources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectSources(fullPath);
    }

    if (!entry.isFile()) {
      return [];
    }

    return /\.(tsx?|css)$/.test(entry.name) && !entry.name.endsWith(".d.ts")
      ? [fullPath]
      : [];
  });
}

type Finding = {
  file: string;
  line: number;
  message: string;
  severity: "error" | "warn";
  snippet: string;
};

const findings: Finding[] = [];

if (runSelfTestOnly || !skipSelfTest) {
  const probes: Array<{ line: string; shouldMatch: boolean; label: string }> = [
    { line: 'style={{ color: "#ff0000" }}', shouldMatch: true, label: "hex in story surface" },
    {
      line: 'background: "oklch(0.205 0.018 264)"',
      shouldMatch: true,
      label: "oklch literal (old v2 foreground)",
    },
    { line: 'className="bg-emerald-500 text-white"', shouldMatch: true, label: "Tailwind palette" },
    { line: 'className="bg-background text-foreground"', shouldMatch: false, label: "semantic tokens" },
    { line: 'background: `var(--primary)`', shouldMatch: false, label: "CSS variable reference" },
    {
      line: 'bg-[conic-gradient(from_180deg,hsl(var(--primary)),transparent)]',
      shouldMatch: false,
      label: "hsl(var(--token)) wrapper",
    },
  ];

  let failed = 0;

  console.log("Hardcoded CSS gate self-test (--self-test):\n");

  for (const probe of probes) {
    const matches = scanLine(probe.line, "error");
    const matched = matches.length > 0;
    const ok = matched === probe.shouldMatch;
    const status = ok ? "PASS" : "FAIL";

    console.log(
      `  ${status} ${probe.label}\n         probe: ${probe.line}\n         matched: ${matched ? matches.map((m) => m.message).join(", ") : "none"}\n`
    );

    if (!ok) {
      failed += 1;
    }
  }

  if (failed > 0) {
    console.error(`Self-test failed: ${failed} probe(s) did not behave as expected.`);
    process.exit(1);
  }

  if (runSelfTestOnly) {
    console.log("Self-test passed — scanner detects drift patterns reliably.");
    process.exit(0);
  }
}

for (const root of scanRoots) {
  for (const filePath of collectSources(root.path)) {
    const source = readFileSync(filePath, "utf8");
    const lines = source.split(/\r?\n/);
    const relativePath = relative(repoRoot, filePath).replace(/\\/g, "/");

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = lines[lineIndex];
      const lineFindings = scanLine(line, root.severity).map((finding) => ({
        ...finding,
        file: relativePath,
        line: lineIndex + 1,
      }));

      findings.push(...lineFindings);
    }
  }
}

const errors = findings.filter((finding) => finding.severity === "error");
const warnings = findings.filter((finding) => finding.severity === "warn");

if (findings.length > 0) {
  console.log("Hardcoded CSS scan results:\n");

  for (const finding of findings) {
    const prefix = finding.severity === "error" ? "ERROR" : "WARN ";
    console.log(
      `  ${prefix} ${finding.file}:${finding.line} — ${finding.message}\n         ${finding.snippet}`
    );
  }

  console.log(
    `\nSummary: ${errors.length} error(s), ${warnings.length} warning(s) across scanned Storybook/UI surfaces.`
  );
  console.log(
    "If Storybook still shows stale colors after token updates, run: pnpm --filter storybook dev:clean"
  );
}

if (errors.length > 0) {
  process.exit(1);
}

if (findings.length === 0) {
  console.log("Hardcoded CSS gate passed — no literal colors in Storybook surfaces.");
} else {
  console.log("\nHardcoded CSS gate passed with warnings (compose/shadcn demo literals).");
}
