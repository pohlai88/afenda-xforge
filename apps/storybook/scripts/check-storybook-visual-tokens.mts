import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const storybookRoot = join(import.meta.dirname, "..");
const storiesRoot = join(storybookRoot, "stories");

const forbiddenClassPatterns = [
  {
    pattern:
      /(?:bg|border|text|ring|fill|stroke)-(gray|slate|zinc|neutral|stone)-/,
    message: "non-token palette utility — use semantic design tokens",
  },
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
    pattern: /bg-size-\[/,
    message:
      "bg-size-[…] is not a reliable Tailwind v4 utility — use sb-intro-grid-bg or bg-[length:…]",
  },
] as const;

function collectStorySources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectStorySources(fullPath);
    }

    return entry.isFile() &&
      /\.(stories\.tsx|stories\.ts|tsx)$/.test(entry.name)
      ? [fullPath]
      : [];
  });
}

const errors: string[] = [];

for (const storyPath of collectStorySources(storiesRoot)) {
  const source = readFileSync(storyPath, "utf8");
  const storyName = storyPath.split(/[/\\]/).pop() ?? storyPath;

  for (const rule of forbiddenClassPatterns) {
    if (rule.pattern.test(source)) {
      errors.push(`${storyName}: ${rule.message}`);
    }
  }

  if (/from\s+["']lucide-react["']/.test(source)) {
    errors.push(
      `${storyName}: lucide-react is not a storybook dependency — use @repo/ui icons or add lucide-react to storybook dependencies`
    );
  }

  if (
    /MetadataOrbitStage|orbit-stage|orbitStage/.test(source) &&
    /overflow-hidden/.test(source) &&
    !storyPath.endsWith("metadata-orbit-layout.tsx")
  ) {
    errors.push(
      `${storyName}: overflow-hidden on orbit stage containers clips orbital nodes — use overflow-visible`
    );
  }
}

if (errors.length > 0) {
  console.error("Storybook visual token gate failed (MUI-VIS-015):\n");
  for (const error of errors) {
    console.error(`  • ${error}`);
  }
  process.exit(1);
}

console.log("Storybook visual token gate passed (MUI-VIS-015).");
