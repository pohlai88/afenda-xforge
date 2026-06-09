import type { CssDeclaration } from "../tokens/css-theme";
import {
  TYPE2_CSS_COMFORTABLE_DENSITY_DECLARATIONS,
  TYPE2_CSS_COMPACT_DENSITY_DECLARATIONS,
  TYPE2_CSS_DARK_DECLARATIONS,
  TYPE2_CSS_KEYFRAMES,
  TYPE2_CSS_ROOT_DECLARATIONS,
  TYPE2_CSS_SOURCE_GLOBS,
  TYPE2_CSS_THEME_DECLARATIONS,
  TYPE2_CSS_UTILITIES,
  validateType2CssTokens,
} from "../tokens/css-theme";

function renderDeclarations(declarations: readonly CssDeclaration[]): string {
  return declarations.map(([name, value]) => `  ${name}: ${value};`).join("\n");
}

function renderBlock(
  selector: string,
  declarations: readonly CssDeclaration[]
) {
  return `${selector} {\n${renderDeclarations(declarations)}\n}`;
}

function renderUtility(name: string, body: string) {
  return `@utility ${name} {\n${body}\n}`;
}

function renderKeyframes(name: keyof typeof TYPE2_CSS_KEYFRAMES) {
  const lines = TYPE2_CSS_KEYFRAMES[name];
  return `@keyframes ${name} {\n${lines
    .map((line) => (line ? `    ${line}` : ""))
    .join("\n")}\n  }`;
}

function assertAdapterCoverage() {
  validateType2CssTokens();
}

export function renderType2Css(): string {
  assertAdapterCoverage();

  return [
    '@import "tailwindcss";',
    "",
    ...TYPE2_CSS_SOURCE_GLOBS.map((source) => `@source "${source}";`),
    "",
    "@custom-variant dark (&:where(.dark, .dark *));",
    "",
    renderBlock(":root", TYPE2_CSS_ROOT_DECLARATIONS),
    "",
    renderBlock(".dark", TYPE2_CSS_DARK_DECLARATIONS),
    "",
    renderBlock(
      '[data-density="compact"]',
      TYPE2_CSS_COMPACT_DENSITY_DECLARATIONS
    ),
    "",
    renderBlock(
      '[data-density="comfortable"]',
      TYPE2_CSS_COMFORTABLE_DENSITY_DECLARATIONS
    ),
    "",
    `@theme inline {\n${renderDeclarations(TYPE2_CSS_THEME_DECLARATIONS)}\n\n  ${renderKeyframes(
      "shimmer"
    )}\n}`,
    "",
    "@layer base {\n  * {\n    @apply border-border outline-ring/50;\n  }\n\n  html {\n    @apply bg-background text-foreground;\n  }\n\n  body {\n    @apply min-h-dvh bg-background text-foreground antialiased;\n  }\n\n  button,\n  input,\n  select,\n  textarea {\n    @apply [font:inherit];\n  }\n}",
    "",
    ...TYPE2_CSS_UTILITIES.flatMap(([name, body]) => [
      renderUtility(name, `  ${body}`),
      "",
    ]),
    "",
    "@media (prefers-reduced-motion: reduce) {\n  *,\n  ::before,\n  ::after {\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    scroll-behavior: auto !important;\n    transition-duration: 0.01ms !important;\n  }\n}",
  ].join("\n");
}

type ParsedCssSnapshot = {
  sources: string[];
  utilities: string[];
  keyframes: string[];
  variables: {
    root: Record<string, string>;
    dark: Record<string, string>;
    density: {
      compact: Record<string, string>;
      comfortable: Record<string, string>;
    };
    theme: Record<string, string>;
  };
};

function normalizeValue(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function extractBalancedBlock(css: string, marker: string): string {
  const start = css.indexOf(`${marker} {`);

  if (start === -1) {
    throw new Error(`Could not find block marker: ${marker}`);
  }

  const openBrace = start + marker.length + 1;
  let depth = 0;

  for (let index = openBrace; index < css.length; index += 1) {
    const char = css[index];

    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return css.slice(openBrace + 1, index);
      }
    }
  }

  throw new Error(`Could not find closing brace for block marker: ${marker}`);
}

function extractCustomProperties(block: string): Record<string, string> {
  const entries: Array<[string, string]> = [];
  const declarationRegex = /(--[a-z0-9-]+):\s*([^;]+);/g;

  for (const match of block.matchAll(declarationRegex)) {
    entries.push([match[1]!, normalizeValue(match[2] ?? "")]);
  }

  return Object.fromEntries(entries);
}

function parseCss(css: string): ParsedCssSnapshot {
  const themeBlock = extractBalancedBlock(css, "@theme inline");

  return {
    sources: [...css.matchAll(/^@source\s+"([^"]+)";$/gm)].map(
      (match) => match[1]!
    ),
    utilities: [...css.matchAll(/^@utility\s+([a-z0-9-]+)\s*\{/gm)].map(
      (match) => match[1]!
    ),
    keyframes: [...themeBlock.matchAll(/@keyframes\s+([a-z0-9-]+)\s*\{/g)].map(
      (match) => match[1]!
    ),
    variables: {
      root: extractCustomProperties(extractBalancedBlock(css, ":root")),
      dark: extractCustomProperties(extractBalancedBlock(css, ".dark")),
      density: {
        compact: extractCustomProperties(
          extractBalancedBlock(css, '[data-density="compact"]')
        ),
        comfortable: extractCustomProperties(
          extractBalancedBlock(css, '[data-density="comfortable"]')
        ),
      },
      theme: extractCustomProperties(themeBlock),
    },
  };
}

export function compareType2Css(actualCss: string): {
  equal: boolean;
  expected: string;
  actual: string;
} {
  const expected = renderType2Css();
  const expectedSnapshot = parseCss(expected);
  const actualSnapshot = parseCss(actualCss);

  return {
    equal: JSON.stringify(expectedSnapshot) === JSON.stringify(actualSnapshot),
    expected,
    actual: actualCss,
  };
}
