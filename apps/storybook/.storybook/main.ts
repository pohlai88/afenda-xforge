import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import { transformWithEsbuild } from "vite";

const storybookDirectory = dirname(fileURLToPath(import.meta.url));
const monorepoRoot = join(storybookDirectory, "../../..");

const appTsxPattern = /\/apps\/app\/.*\.tsx$/;

function storybookAppJsxPlugin() {
  return {
    name: "storybook:jsx-apps-app",
    enforce: "pre" as const,
    async transform(code: string, id: string) {
      const normalizedId = id.replace(/\\/g, "/");
      if (!appTsxPattern.test(normalizedId)) {
        return null;
      }

      return transformWithEsbuild(code, id, {
        jsx: "automatic",
        loader: "tsx",
      });
    },
  };
}

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(ts|tsx)",
  ],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      tsconfigPath: "./tsconfig.json",
      propFilter: (prop) => {
        if (!prop.parent) {
          return true;
        }

        const fileName = prop.parent.fileName.replace(/\\/g, "/");

        if (/node_modules/.test(fileName)) {
          return false;
        }

        if (/packages\/(ui|metadata-ui)/.test(fileName)) {
          return false;
        }

        return /apps\/storybook\/stories/.test(fileName);
      },
    },
  },
  viteFinal: (config, { configType }) => {
    const pagesBase = process.env.STORYBOOK_BASE_PATH?.trim();
    if (configType === "PRODUCTION" && pagesBase) {
      config.base = pagesBase.endsWith("/") ? pagesBase : `${pagesBase}/`;
    }

    config.resolve = {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias as Record<string, string> | undefined),
        "next/link": join(storybookDirectory, "mocks/next-link.tsx"),
        "next/navigation": join(storybookDirectory, "mocks/next-navigation.ts"),
      },
    };

    config.plugins = [...(config.plugins ?? []), storybookAppJsxPlugin()];

    config.optimizeDeps = {
      ...config.optimizeDeps,
      include: [
        ...(config.optimizeDeps?.include ?? []),
        "react",
        "react-dom",
        "react/jsx-dev-runtime",
        "react/jsx-runtime",
      ],
    };

    config.server = {
      ...config.server,
      fs: {
        ...config.server?.fs,
        allow: [...(config.server?.fs?.allow ?? []), monorepoRoot],
      },
    };

    config.build = {
      ...config.build,
      sourcemap: false,
      target: "esnext",
    };

    return config;
  },
};

export default config;
