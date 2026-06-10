import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const composeRoot = path.join(packageRoot, "src/components/compose");

const missing: Array<[string, string, string]> = [
  ["aspect-ratio", "aspectRatioPatternCatalog", "AspectRatioComposeGallery"],
  ["avatar", "avatarPatternCatalog", "AvatarComposeGallery"],
  ["breadcrumb", "breadcrumbPatternCatalog", "BreadcrumbComposeGallery"],
  ["button", "buttonPatternCatalog", "ButtonComposeGallery"],
  ["button-group", "buttonGroupPatternCatalog", "ButtonGroupComposeGallery"],
  ["card", "cardPatternCatalog", "CardComposeGallery"],
  ["chart", "chartPatternCatalog", "ChartComposeGallery"],
  ["checkbox", "checkboxPatternCatalog", "CheckboxComposeGallery"],
  ["collapsible", "collapsiblePatternCatalog", "CollapsibleComposeGallery"],
  ["combobox", "comboboxPatternCatalog", "ComboboxComposeGallery"],
  ["command", "commandPatternCatalog", "CommandComposeGallery"],
  [
    "dropdown-menu",
    "dropdownMenuPatternCatalog",
    "DropdownMenuComposeGallery",
  ],
  ["empty", "emptyPatternCatalog", "EmptyComposeGallery"],
  ["field", "fieldPatternCatalog", "FieldComposeGallery"],
  [
    "input-group",
    "inputGroupPatternCatalog",
    "InputGroupComposeGallery",
  ],
  ["sheet", "sheetPatternCatalog", "SheetComposeGallery"],
  ["skeleton", "skeletonPatternCatalog", "SkeletonComposeGallery"],
  ["spinner", "spinnerPatternCatalog", "SpinnerComposeGallery"],
  ["stepper", "stepperPatternCatalog", "StepperComposeGallery"],
  ["tabs", "tabsPatternCatalog", "TabsComposeGallery"],
  ["timeline", "timelinePatternCatalog", "TimelineComposeGallery"],
  ["tree", "treePatternCatalog", "TreeComposeGallery"],
];

for (const [dir, catalog, galleryName] of missing) {
  const file = path.join(composeRoot, dir, `${dir}-gallery.tsx`);
  const content = `"use client";

import { ${catalog} } from "./${dir}.catalog";

export function ${galleryName}() {
  return (
    <div className="grid gap-6">
      {${catalog}.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
`;

  fs.writeFileSync(file, content);
  console.log(`wrote ${file}`);
}
