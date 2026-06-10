export type VisualTokenRule = {
  pattern: RegExp;
  message: string;
};

/** Shared forbidden visual patterns for metadata-ui production surfaces (MUI-VIS-014). */
export const forbiddenVisualTokenPatterns: VisualTokenRule[] = [
  {
    pattern: /#[0-9a-fA-F]{3,8}\b/,
    message: "hardcoded hex color",
  },
  {
    pattern: /\brgb\s*\(/,
    message: "hardcoded rgb() color",
  },
  {
    pattern: /\bhsl\s*\(/,
    message: "hardcoded hsl() color",
  },
  {
    pattern: /<textarea\b/,
    message: "raw textarea element — use @repo/ui Textarea",
  },
  {
    pattern: /<select\b/,
    message: "raw select element — use @repo/ui NativeSelect",
  },
  {
    pattern: /<input\b(?![^>]*type=["']hidden["'])/,
    message: "raw input element — use @repo/ui Input, Checkbox, or Switch",
  },
  {
    pattern: /<button\b/,
    message: "raw button element — use @repo/ui Button",
  },
  {
    pattern:
      /(?:bg|border|text|ring|fill|stroke)-(gray|slate|zinc|neutral|stone)-/,
    message: "non-token palette utility — use semantic design tokens",
  },
];

export const exemptVisualTokenRelativePaths = new Set([
  "src/interaction/keyboard-focus-contract.ts",
  "src/fixtures.ts",
]);

export function isExemptVisualTokenFile(relativePath: string): boolean {
  if (exemptVisualTokenRelativePaths.has(relativePath)) {
    return true;
  }

  if (relativePath.endsWith(".contract.ts")) {
    return true;
  }

  if (
    relativePath.endsWith("/index.ts") ||
    relativePath.endsWith("\\index.ts")
  ) {
    return true;
  }

  return false;
}

export function collectVisualTokenViolations(
  relativePath: string,
  source: string,
  rules: readonly VisualTokenRule[] = forbiddenVisualTokenPatterns
): string[] {
  if (isExemptVisualTokenFile(relativePath)) {
    return [];
  }

  const violations: string[] = [];

  for (const rule of rules) {
    if (rule.pattern.test(source)) {
      violations.push(`${relativePath}: ${rule.message}`);
    }
  }

  return violations;
}
