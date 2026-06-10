import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { composeRegistryGroups } from "@repo/ui";
import type { ComposeComponentKind } from "@repo/ui/components/compose/compose.contract";

function toStoryExportName(name: string): string {
  return name
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}

const categories: Array<{
  file: string;
  title: string;
  kinds: readonly ComposeComponentKind[];
}> = [
  {
    file: "ui-compose-form.stories.tsx",
    title: "UI/Compose/Form",
    kinds: ["data-entry", "action"],
  },
  {
    file: "ui-compose-data.stories.tsx",
    title: "UI/Compose/Data",
    kinds: ["data-display", "visualization"],
  },
  {
    file: "ui-compose-navigation.stories.tsx",
    title: "UI/Compose/Navigation",
    kinds: ["navigation"],
  },
  {
    file: "ui-compose-feedback.stories.tsx",
    title: "UI/Compose/Feedback",
    kinds: ["feedback", "interaction", "layout"],
  },
];

const storiesDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../stories"
);

const legacyMonolith = path.join(storiesDir, "ui-compose-galleries.stories.tsx");

/** Manifest-priority compose groups promoted to CI a11y gates after @repo/ui fixes. */
const A11Y_ERROR_GROUPS = new Set([
  "button",
  "checkbox",
  "field",
  "dropdown-menu",
  "card",
  "tabs",
  "empty",
  "skeleton",
]);

function galleryImportPath(name: string, exportName: string): string {
  return `import { ${exportName} } from "../../../packages/ui/src/components/compose/${name}/${name}-gallery";`;
}

function generateCategoryFile(
  file: string,
  title: string,
  kinds: readonly ComposeComponentKind[]
): void {
  const groups = composeRegistryGroups.filter((group) =>
    kinds.includes(group.kind)
  );

  const imports = groups
    .map((group) => {
      const exportName = `${toStoryExportName(group.name)}ComposeGallery`;
      return galleryImportPath(group.name, exportName);
    })
    .join("\n");

  const stories = groups
    .map((group) => {
      const exportName = toStoryExportName(group.name);
      const a11yTier = A11Y_ERROR_GROUPS.has(group.name) ? "error" : "todo";
      return `export const ${exportName}: Story = galleryStory(${exportName}ComposeGallery, "${a11yTier}");`;
    })
    .join("\n");

  const content = `${imports}
import type { Meta, StoryObj } from "@storybook/react";

import { galleryStory } from "./ui-compose-story-utils";

const meta = {
  title: "${title}",
  parameters: {
    layout: "fullscreen",
    a11y: { test: "todo" as const },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

${stories}
`;

  const out = path.join(storiesDir, file);
  fs.writeFileSync(out, content);
  console.log(`wrote ${out} (${groups.length} galleries)`);
}

for (const category of categories) {
  generateCategoryFile(category.file, category.title, category.kinds);
}

if (fs.existsSync(legacyMonolith)) {
  fs.unlinkSync(legacyMonolith);
  console.log(`removed ${legacyMonolith}`);
}
