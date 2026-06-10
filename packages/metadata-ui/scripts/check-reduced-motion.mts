import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { isEntrypoint, packageRoot } from "./generator-lib.mts";

const motionContractPath = join(
  packageRoot,
  "src",
  "interaction",
  "motion-visual-contract.ts"
);
const metadataMotionSkeletonPath = join(
  packageRoot,
  "src",
  "components",
  "metadata-motion-skeleton.tsx"
);
const stateVisualIconsPath = join(
  packageRoot,
  "src",
  "renderers",
  "states",
  "state-visual-icons.tsx"
);
const loadingStatePath = join(
  packageRoot,
  "src",
  "renderers",
  "states",
  "loading-state.renderer.tsx"
);
const activityTablePath = join(
  packageRoot,
  "src",
  "components",
  "activity-table.tsx"
);
const baseActionPath = join(
  packageRoot,
  "src",
  "renderers",
  "actions",
  "base-action.renderer.tsx"
);

const scanRoots = [
  join(packageRoot, "src", "renderers"),
  join(packageRoot, "src", "components"),
];

const exemptMotionFiles = new Set([
  relative(packageRoot, motionContractPath),
  relative(packageRoot, metadataMotionSkeletonPath),
]);

const forbiddenMotionPatterns = [
  {
    pattern: /\banimate-spin\b/,
    message:
      "use METADATA_SPINNER_MOTION_CLASS from motion-visual-contract (MUI-VIS-010)",
  },
  {
    pattern: /\banimate-pulse\b/,
    message:
      "use MetadataMotionSkeleton or METADATA_PULSE_MOTION_CLASS (MUI-VIS-010)",
  },
  {
    pattern: /\btransition-all\b/,
    message:
      "transition-all animates non-safe properties — use transform/opacity only (MUI-VIS-010)",
  },
  {
    pattern: /\btransition-colors\b/,
    message:
      "transition-colors is disallowed — use transform/opacity transitions only (MUI-VIS-010)",
  },
  {
    pattern: /\btransition-shadow\b/,
    message:
      "transition-shadow is disallowed — use transform/opacity transitions only (MUI-VIS-010)",
  },
  {
    pattern: /\btransition-\[(?!transform|opacity)/,
    message:
      "custom transitions must target transform/opacity only (MUI-VIS-010)",
  },
] as const;

function collectSourceFiles(directory: string): string[] {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const filePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(filePath));
      continue;
    }

    if (
      entry.isFile() &&
      (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))
    ) {
      files.push(filePath);
    }
  }

  return files;
}

function assertRequiredPatterns(
  filePath: string,
  source: string,
  patterns: Array<{ pattern: RegExp; message: string }>,
  violations: string[]
): void {
  const relativePath = relative(packageRoot, filePath);

  for (const rule of patterns) {
    if (!rule.pattern.test(source)) {
      violations.push(`${relativePath}: ${rule.message}`);
    }
  }
}

function checkMotionContract(violations: string[]): void {
  const source = readFileSync(motionContractPath, "utf8");
  const contractChecks = [
    {
      includes: "METADATA_SPINNER_MOTION_CLASS",
      message: "must define spinner motion class (MUI-VIS-010)",
    },
    {
      includes: "motion-reduce:animate-none",
      message:
        "must honor prefers-reduced-motion via motion-reduce (MUI-VIS-010)",
    },
    {
      includes: "METADATA_PULSE_MOTION_CLASS",
      message: "must define pulse motion class for skeletons (MUI-VIS-010)",
    },
    {
      includes: "METADATA_DIALOG_MOTION_CLASS",
      message: "must define dialog motion class (MUI-VIS-010)",
    },
    {
      includes: "isMetadataSafeTransitionProperty",
      message: "must expose safe transition property guard (MUI-VIS-010)",
    },
  ] as const;

  for (const check of contractChecks) {
    if (!source.includes(check.includes)) {
      violations.push(
        `${relative(packageRoot, motionContractPath)}: ${check.message}`
      );
    }
  }
}

function checkAnimatedSurfaces(violations: string[]): void {
  assertRequiredPatterns(
    stateVisualIconsPath,
    readFileSync(stateVisualIconsPath, "utf8"),
    [
      {
        pattern: /METADATA_SPINNER_MOTION_CLASS/,
        message:
          "loader icon must use motion contract spinner class (MUI-VIS-010)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    loadingStatePath,
    readFileSync(loadingStatePath, "utf8"),
    [
      {
        pattern: /MetadataMotionSkeleton/,
        message: "loading state must use MetadataMotionSkeleton (MUI-VIS-010)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    activityTablePath,
    readFileSync(activityTablePath, "utf8"),
    [
      {
        pattern: /MetadataMotionSkeleton|MetadataTableLoadingSkeleton/,
        message:
          "activity table loading rows must use MetadataMotionSkeleton or MetadataTableLoadingSkeleton (MUI-VIS-010)",
      },
    ],
    violations
  );

  assertRequiredPatterns(
    baseActionPath,
    readFileSync(baseActionPath, "utf8"),
    [
      {
        pattern: /METADATA_DIALOG_MOTION_CLASS/,
        message:
          "destructive confirmation dialog must apply reduced-motion class (MUI-VIS-010)",
      },
    ],
    violations
  );

  const skeletonSource = readFileSync(metadataMotionSkeletonPath, "utf8");

  if (!skeletonSource.includes("METADATA_PULSE_MOTION_CLASS")) {
    violations.push(
      `${relative(packageRoot, metadataMotionSkeletonPath)}: skeleton wrapper must compose pulse motion class (MUI-VIS-010)`
    );
  }
}

function checkForbiddenMotionPatterns(violations: string[]): void {
  for (const root of scanRoots) {
    for (const filePath of collectSourceFiles(root)) {
      const relativePath = relative(packageRoot, filePath);

      if (exemptMotionFiles.has(relativePath)) {
        continue;
      }

      const source = readFileSync(filePath, "utf8");

      for (const rule of forbiddenMotionPatterns) {
        if (rule.pattern.test(source)) {
          violations.push(`${relativePath}: ${rule.message}`);
        }
      }
    }
  }
}

export function checkReducedMotion(): void {
  const violations: string[] = [];

  checkMotionContract(violations);
  checkAnimatedSurfaces(violations);
  checkForbiddenMotionPatterns(violations);

  if (violations.length > 0) {
    throw new Error(
      `MUI-VIS-010 reduced-motion lint failed:\n${violations
        .map((violation) => `- ${violation}`)
        .join("\n")}`
    );
  }
}

if (isEntrypoint(import.meta.url)) {
  checkReducedMotion();
  console.log("metadata-ui reduced-motion lint passed (MUI-VIS-010)");
}
