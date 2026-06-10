import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function toStoryExportName(name: string): string {
  return name
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}

const galleries = [
  "accordion",
  "alert",
  "alert-dialog",
  "aspect-ratio",
  "autocomplete",
  "avatar",
  "badge",
  "breadcrumb",
  "button",
  "button-group",
  "card",
  "chart",
  "checkbox",
  "collapsible",
  "combobox",
  "command",
  "data-grid",
  "date-selector",
  "dropdown-menu",
  "empty",
  "field",
  "file-upload",
  "filters",
  "frame",
  "input-group",
  "kanban",
  "line-chart",
  "number-field",
  "phone-input",
  "rating",
  "scrollspy",
  "sheet",
  "skeleton",
  "sortable",
  "spinner",
  "statistic-card",
  "stepper",
  "tabs",
  "timeline",
  "tree",
];

const imports = galleries
  .map((name) => {
    const exportName = `${toStoryExportName(name)}ComposeGallery`;
    return exportName;
  })
  .join(",\n  ");

const stories = galleries
  .map((name) => {
    const exportName = toStoryExportName(name);
    const gallery = `${exportName}ComposeGallery`;
    return `export const ${exportName}: Story = galleryStory(${gallery});`;
  })
  .join("\n");

const content = `import {
  ${imports},
} from "@repo/ui/components/compose/previews";
import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType, ReactNode } from "react";

function GalleryFrame({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl p-6 md:p-10">{children}</div>;
}

function galleryStory(Gallery: ComponentType) {
  return {
    render: () => (
      <GalleryFrame>
        <Gallery />
      </GalleryFrame>
    ),
  };
}

const meta = {
  title: "UI/Compose",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

${stories}
`;

const out = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../stories/ui-compose-galleries.stories.tsx"
);
fs.writeFileSync(out, content);
console.log(`wrote ${out}`);
