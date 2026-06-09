import type { PlopTypes } from "@turbo/gen";

type Answers = Record<string, unknown>;

const canonicalizeName = (value: string): string =>
  value
    .trim()
    .replace(/^@repo\//, "")
    .toLowerCase()
    .replace(/\s+/g, "-");

const normalizeName = (answers: Answers, key = "name"): string => {
  const current = answers[key];

  if (typeof current !== "string") {
    throw new Error(`Expected ${key} to be a string`);
  }

  const sanitized = canonicalizeName(current);

  if (!sanitized) {
    throw new Error(`Expected ${key} to be non-empty`);
  }

  if (sanitized.includes("/") || sanitized.includes("\\")) {
    throw new Error(
      `Expected ${key} to be a single workspace segment, not a path`
    );
  }

  if (!/^[a-z0-9][a-z0-9-_]*$/.test(sanitized)) {
    throw new Error(
      `Expected ${key} to use lowercase letters, numbers, hyphens, or underscores`
    );
  }

  answers[key] = sanitized;
  return sanitized;
};

const splitIdentifier = (value: string): string[] =>
  value.split(/[-_]+/).filter(Boolean);

const toPascalCase = (value: string): string =>
  splitIdentifier(value)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");

const toCamelCase = (value: string): string => {
  const pascal = toPascalCase(value);

  return `${pascal.charAt(0).toLowerCase()}${pascal.slice(1)}`;
};

const singularizeSegment = (value: string): string => {
  if (value.endsWith("ies") && value.length > 3) {
    return `${value.slice(0, -3)}y`;
  }

  if (
    (value.endsWith("sses") ||
      value.endsWith("ches") ||
      value.endsWith("shes") ||
      value.endsWith("xes")) &&
    value.length > 4
  ) {
    return value.slice(0, -2);
  }

  if (value.endsWith("s") && !value.endsWith("ss") && value.length > 1) {
    return value.slice(0, -1);
  }

  return value;
};

const singularizeName = (value: string): string => {
  const parts = splitIdentifier(value);
  const lastPart = parts.at(-1);

  if (!lastPart) {
    return value;
  }

  return [...parts.slice(0, -1), singularizeSegment(lastPart)].join("-");
};

const normalizeFeatureName = (answers: Answers): string => {
  const featureName = normalizeName(answers);
  const recordName = singularizeName(featureName);

  answers.featurePascal = toPascalCase(featureName);
  answers.featureCamel = toCamelCase(featureName);
  answers.recordPascal = toPascalCase(recordName);
  answers.recordCamel = toCamelCase(recordName);
  answers.packageName = `@repo/features-master-data-${featureName}`;

  return featureName;
};

const validateWorkspaceName = (input: string): true | string => {
  const sanitized = canonicalizeName(input);

  if (!sanitized) {
    return "Name is required";
  }

  if (!/^[a-z0-9][a-z0-9-_]*$/.test(sanitized)) {
    return "Use lowercase letters, numbers, hyphens, or underscores only";
  }

  return true;
};

const addFiles = (
  files: Array<{ path: string; templateFile: string }>
): PlopTypes.AddActionConfig[] =>
  files.map((file) => ({
    type: "add",
    path: file.path,
    templateFile: file.templateFile,
  }));

const packagePrompt: PlopTypes.PromptQuestion = {
  type: "input",
  name: "name",
  message: "What is the package name? (omit the `@repo/` prefix if you use it)",
  validate: validateWorkspaceName,
};

const appPrompt: PlopTypes.PromptQuestion = {
  type: "input",
  name: "name",
  message: "What is the app name? (example: app, web, docs)",
  validate: validateWorkspaceName,
};

const featurePrompt: PlopTypes.PromptQuestion = {
  type: "input",
  name: "name",
  message:
    "What is the master-data feature name? (examples: customers, companies, suppliers, products, locations, departments, tax-codes, currencies)",
  validate: validateWorkspaceName,
};

const featureScopePrompt: PlopTypes.PromptQuestion = {
  type: "list",
  name: "companyScoped",
  message: "Is the feature company-scoped?",
  choices: [
    {
      name: "No, tenant-scoped",
      value: false,
    },
    {
      name: "Yes, company-scoped",
      value: true,
    },
  ],
};

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("package", {
    description: "Generate a new XForge workspace package",
    prompts: [packagePrompt],
    actions: [
      (answers: Answers) => {
        normalizeName(answers);
        return "Package name normalized";
      },
      ...addFiles([
        {
          path: "packages/{{ name }}/package.json",
          templateFile: "templates/package.json.hbs",
        },
        {
          path: "packages/{{ name }}/tsconfig.json",
          templateFile: "templates/tsconfig.json.hbs",
        },
        {
          path: "packages/{{ name }}/src/index.ts",
          templateFile: "templates/package/src/index.ts.hbs",
        },
      ]),
    ],
  });

  plop.setGenerator("app", {
    description: "Generate a new XForge Next.js app",
    prompts: [appPrompt],
    actions: [
      (answers: Answers) => {
        normalizeName(answers);
        return "App name normalized";
      },
      ...addFiles([
        {
          path: "apps/{{ name }}/package.json",
          templateFile: "templates/app/package.json.hbs",
        },
        {
          path: "apps/{{ name }}/tsconfig.json",
          templateFile: "templates/app/tsconfig.json.hbs",
        },
        {
          path: "apps/{{ name }}/next.config.ts",
          templateFile: "templates/app/next.config.ts.hbs",
        },
        {
          path: "apps/{{ name }}/proxy.ts",
          templateFile: "templates/app/proxy.ts.hbs",
        },
        {
          path: "apps/{{ name }}/app/api/ping/contract.ts",
          templateFile: "templates/app/app/api/ping/contract.ts.hbs",
        },
        {
          path: "apps/{{ name }}/app/api/ping/route.ts",
          templateFile: "templates/app/app/api/ping/route.ts.hbs",
        },
        {
          path: "apps/{{ name }}/postcss.config.mjs",
          templateFile: "templates/app/postcss.config.mjs.hbs",
        },
        {
          path: "apps/{{ name }}/next-env.d.ts",
          templateFile: "templates/app/next-env.d.ts.hbs",
        },
        {
          path: "apps/{{ name }}/.env.example",
          templateFile: "templates/app/.env.example.hbs",
        },
        {
          path: "apps/{{ name }}/app/layout.tsx",
          templateFile: "templates/app/app/layout.tsx.hbs",
        },
        {
          path: "apps/{{ name }}/app/page.tsx",
          templateFile: "templates/app/app/page.tsx.hbs",
        },
        {
          path: "apps/{{ name }}/app/providers.tsx",
          templateFile: "templates/app/app/providers.tsx.hbs",
        },
        {
          path: "apps/{{ name }}/app/styles.css",
          templateFile: "templates/app/app/styles.css.hbs",
        },
        {
          path: "apps/{{ name }}/app/(authenticated)/layout.tsx",
          templateFile: "templates/app/app/(authenticated)/layout.tsx.hbs",
        },
        {
          path: "apps/{{ name }}/app/(authenticated)/dashboard/page.tsx",
          templateFile:
            "templates/app/app/(authenticated)/dashboard/page.tsx.hbs",
        },
        {
          path: "apps/{{ name }}/app/(unauthenticated)/layout.tsx",
          templateFile: "templates/app/app/(unauthenticated)/layout.tsx.hbs",
        },
        {
          path: "apps/{{ name }}/app/(unauthenticated)/sign-in/[[...sign-in]]/page.tsx",
          templateFile:
            "templates/app/app/(unauthenticated)/sign-in/[[...sign-in]]/page.tsx.hbs",
        },
        {
          path: "apps/{{ name }}/app/(unauthenticated)/sign-up/[[...sign-up]]/page.tsx",
          templateFile:
            "templates/app/app/(unauthenticated)/sign-up/[[...sign-up]]/page.tsx.hbs",
        },
      ]),
    ],
  });

  plop.setGenerator("feature", {
    description: "Generate a new XForge master-data feature package",
    prompts: [featurePrompt, featureScopePrompt],
    actions: [
      (answers: Answers) => {
        normalizeFeatureName(answers);
        return "Feature name normalized";
      },
      ...addFiles([
        {
          path: "packages/features/master-data/{{ name }}/package.json",
          templateFile: "templates/feature/package.json.hbs",
        },
        {
          path: "packages/features/master-data/{{ name }}/tsconfig.json",
          templateFile: "templates/feature/tsconfig.json.hbs",
        },
        {
          path: "packages/features/master-data/{{ name }}/src/index.ts",
          templateFile: "templates/feature/src/index.ts.hbs",
        },
        {
          path: "packages/features/master-data/{{ name }}/src/shared/index.ts",
          templateFile: "templates/feature/src/shared/index.ts.hbs",
        },
        {
          path: "packages/features/master-data/{{ name }}/src/execution/index.ts",
          templateFile: "templates/feature/src/execution/index.ts.hbs",
        },
        {
          path: "packages/features/master-data/{{ name }}/src/manifest.ts",
          templateFile: "templates/feature/src/manifest.ts.hbs",
        },
        {
          path: "packages/features/master-data/{{ name }}/src/contract.ts",
          templateFile: "templates/feature/src/contract.ts.hbs",
        },
        {
          path: "packages/features/master-data/{{ name }}/src/schema.ts",
          templateFile: "templates/feature/src/schema.ts.hbs",
        },
        {
          path: "packages/features/master-data/{{ name }}/src/metadata.ts",
          templateFile: "templates/feature/src/metadata.ts.hbs",
        },
        {
          path: "packages/features/master-data/{{ name }}/src/server.ts",
          templateFile: "templates/feature/src/server.ts.hbs",
        },
        {
          path: "packages/features/master-data/{{ name }}/src/queries.ts",
          templateFile: "templates/feature/src/queries.ts.hbs",
        },
        {
          path: "packages/features/master-data/{{ name }}/src/actions.ts",
          templateFile: "templates/feature/src/actions.ts.hbs",
        },
        {
          path: "packages/features/master-data/{{ name }}/src/components/.gitkeep",
          templateFile: "templates/empty.hbs",
        },
        {
          path: "packages/features/master-data/{{ name }}/src/forms/.gitkeep",
          templateFile: "templates/empty.hbs",
        },
        {
          path: "packages/features/master-data/{{ name }}/src/tables/.gitkeep",
          templateFile: "templates/empty.hbs",
        },
        {
          path: "packages/features/master-data/{{ name }}/src/tests/.gitkeep",
          templateFile: "templates/empty.hbs",
        },
      ]),
    ],
  });
}
