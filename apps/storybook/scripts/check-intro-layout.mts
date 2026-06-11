import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const storybookRoot = join(import.meta.dirname, "..");
const storiesRoot = join(storybookRoot, "stories");
const previewCssPath = join(storybookRoot, ".storybook/preview.css");
const orbitLayoutPath = join(storiesRoot, "metadata-orbit-layout.tsx");

const introStoryFiles = [
  join(storiesRoot, "00-introduction.stories.tsx"),
  join(storiesRoot, "01-living-metadata-canvas.stories.tsx"),
] as const;

function collectStorySources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectStorySources(fullPath);
    }

    return entry.isFile() && /\.stories\.(ts|tsx)$/.test(entry.name)
      ? [fullPath]
      : [];
  });
}

const errors: string[] = [];

if (!existsSync(orbitLayoutPath)) {
  errors.push(
    "stories/metadata-orbit-layout.tsx is required for intro orbit layouts"
  );
}

const orbitLayoutSource = existsSync(orbitLayoutPath)
  ? readFileSync(orbitLayoutPath, "utf8")
  : "";

if (
  orbitLayoutSource &&
  !orbitLayoutSource.includes("@repo/metadata-ui/visualization/orbit-layout")
) {
  errors.push(
    "metadata-orbit-layout.tsx must import sizing from @repo/metadata-ui/visualization/orbit-layout"
  );
}

if (!orbitLayoutSource.includes("MetadataOrbitStage")) {
  errors.push("metadata-orbit-layout.tsx must export MetadataOrbitStage");
}

if (!orbitLayoutSource.includes("overflow-visible")) {
  errors.push(
    "metadata-orbit-layout.tsx: MetadataOrbitStage stage root must use overflow-visible"
  );
}

for (const storyPath of introStoryFiles) {
  const source = readFileSync(storyPath, "utf8");
  const storyName = storyPath.split(/[/\\]/).pop() ?? storyPath;

  if (!source.includes("MetadataOrbitStage")) {
    errors.push(
      `${storyName}: must render orbital UI through MetadataOrbitStage`
    );
  }

  if (/style=\{\{[\s\S]*?transform:/.test(source)) {
    errors.push(
      `${storyName}: must not use inline style.transform for orbital nodes — use MetadataOrbitStage pin pattern`
    );
  }

  if (/MetadataOrbitStage[\s\S]*absolute[\s\S]*bottom-0/.test(source)) {
    errors.push(
      `${storyName}: stats/footer must not use absolute bottom-0 inside MetadataOrbitStage — place outside the stage`
    );
  }
}

for (const storyPath of collectStorySources(storiesRoot)) {
  const source = readFileSync(storyPath, "utf8");
  const storyName = storyPath.split(/[/\\]/).pop() ?? storyPath;

  if (/bg-size-\[/.test(source)) {
    errors.push(
      `${storyName}: bg-size-[…] is not a reliable Tailwind v4 utility — use sb-intro-grid-bg or bg-[length:…]`
    );
  }

  if (
    /hover:-translate/.test(source) &&
    /style=\{\{[\s\S]*?transform:/.test(source)
  ) {
    errors.push(
      `${storyName}: hover translate on the same node as inline transform breaks orbital placement`
    );
  }
}

const previewCss = readFileSync(previewCssPath, "utf8");

if (!/@utility\s+sb-intro-grid-bg/.test(previewCss)) {
  errors.push(
    "preview.css must declare @utility sb-intro-grid-bg for grid backgrounds"
  );
}

if (errors.length > 0) {
  console.error("Intro layout gate failed:\n");
  for (const error of errors) {
    console.error(`  • ${error}`);
  }
  process.exit(1);
}

console.log("Intro layout gate passed.");
