import { renderGlobalsCss } from "./globals-css.render";

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
  const entries: [string, string][] = [];
  const declarationRegex = /(--[a-z0-9-]+):\s*([^;]+);/g;

  for (const match of block.matchAll(declarationRegex)) {
    const name = match[1];

    if (!name) {
      continue;
    }

    entries.push([name, normalizeValue(match[2] ?? "")]);
  }

  return Object.fromEntries(entries);
}

function requireCapture(match: RegExpMatchArray): string {
  const value = match[1];

  if (!value) {
    throw new Error(`Could not read regex capture from ${match[0]}`);
  }

  return value;
}

function parseCss(css: string): ParsedCssSnapshot {
  const themeBlock = extractBalancedBlock(css, "@theme inline");

  return {
    sources: [...css.matchAll(/^@source\s+"([^"]+)";$/gm)].map(requireCapture),
    utilities: [...css.matchAll(/^@utility\s+([a-z0-9-]+)\s*\{/gm)].map(
      requireCapture
    ),
    keyframes: [...themeBlock.matchAll(/@keyframes\s+([a-z0-9-]+)\s*\{/g)].map(
      requireCapture
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

export function compareGlobalsCss(
  actualCss: string,
  expectedCss?: string
): {
  equal: boolean;
  expected: string;
  actual: string;
} {
  const expected = expectedCss ?? renderGlobalsCss();
  const expectedSnapshot = parseCss(expected);
  const actualSnapshot = parseCss(actualCss);

  return {
    equal: JSON.stringify(expectedSnapshot) === JSON.stringify(actualSnapshot),
    expected,
    actual: actualCss,
  };
}
