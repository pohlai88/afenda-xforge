import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { composeRegistryGroups } from "@repo/ui";
import type { ComposeComponentKind } from "@repo/ui/components/compose";

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

/** All compose registry groups gate at error in test:stories (batches 1–3). */
const A11Y_ERROR_GROUPS = new Set(
  composeRegistryGroups.map((group) => group.name)
);

function lazyGalleryStoryLine(
  name: string,
  storyExportName: string,
  a11yTier: string
): string {
  const galleryExport = `${storyExportName}ComposeGallery`;
  const importPath = `../../../packages/ui/src/components/compose/${name}/${name}-gallery`;
  return `export const ${storyExportName}: Story = lazyGalleryStory(() => import("${importPath}").then((module) => ({ default: module.${galleryExport} })), "${a11yTier}");`;
}

function generateCategoryFile(
  file: string,
  title: string,
  kinds: readonly ComposeComponentKind[]
): void {
  const groups = composeRegistryGroups.filter((group) =>
    kinds.includes(group.kind)
  );

  const stories = groups
    .map((group) => {
      const exportName = toStoryExportName(group.name);
      const a11yTier = A11Y_ERROR_GROUPS.has(group.name) ? "error" : "todo";
      return lazyGalleryStoryLine(group.name, exportName, a11yTier);
    })
    .join("\n");

  const formDocsExtras =
    file === "ui-compose-form.stories.tsx"
      ? `
    docs: {
      description: {
        component:
          "Data-entry and action compose galleries. Stories promoted to a11y.test error enforce axe in test:stories.",
      },
    },`
      : "";

  const formArgTypes =
    file === "ui-compose-form.stories.tsx"
      ? `
  argTypes: {
    showLink: {
      control: "boolean",
      description: "Compose autodocs argTypes example (see UI Primitives Actions)",
      table: { category: "Compose controls example" },
    },
  },`
      : "";

  const content = `import type { Meta, StoryObj } from "@storybook/react";

import { lazyGalleryStory } from "./ui-compose-story-utils";

const meta = {
  title: "${title}",
  parameters: {
    layout: "fullscreen",
    a11y: { test: "todo" as const },${formDocsExtras}
  },
  tags: ["autodocs"],${formArgTypes}
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
