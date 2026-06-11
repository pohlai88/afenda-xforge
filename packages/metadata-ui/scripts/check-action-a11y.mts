import { readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const actionRendererRoot = join(packageRoot, "src", "renderers", "actions");

const requiredFiles = [
  {
    file: "base-action.renderer.tsx",
    patterns: [
      {
        pattern: /AlertDialogTitle/,
        message:
          "destructive confirmation must expose AlertDialogTitle (MUI-VIS-005)",
      },
      {
        pattern: /AlertDialogDescription/,
        message:
          "destructive confirmation must expose AlertDialogDescription (MUI-VIS-005)",
      },
      {
        pattern: /data-action-surface/,
        message:
          "action triggers must expose data-action-surface (MUI-VIS-004)",
      },
    ],
  },
  {
    file: "menu-action-surface.tsx",
    patterns: [
      {
        pattern: /DropdownMenuTrigger/,
        message: "menu surface must use DropdownMenuTrigger (MUI-VIS-004)",
      },
      {
        pattern: /DropdownMenuItem/,
        message:
          "menu surface must expose DropdownMenuItem actions (MUI-VIS-004)",
      },
      {
        pattern: /aria-haspopup="menu"/,
        message: "menu trigger must declare aria-haspopup=menu (MUI-VIS-005)",
      },
    ],
  },
] as const;

export function checkActionA11y(): void {
  const violations: string[] = [];

  for (const requirement of requiredFiles) {
    const filePath = join(actionRendererRoot, requirement.file);
    const source = readFileSync(filePath, "utf8");
    const relativePath = relative(packageRoot, filePath);

    for (const rule of requirement.patterns) {
      if (!rule.pattern.test(source)) {
        violations.push(`${relativePath}: ${rule.message}`);
      }
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `MUI-VIS-005 action a11y lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkActionA11y();
  console.log(
    "metadata-ui action a11y lint passed (MUI-VIS-005 action surfaces)"
  );
}
