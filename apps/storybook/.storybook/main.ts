import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";

const storybookDirectory = dirname(fileURLToPath(import.meta.url));
const monorepoRoot = join(storybookDirectory, "../../..");

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
  typescript: {
    // Workspace packages are outside this app's TS project; keep docgen off to
    // avoid scanning the full ui/metadata-ui graphs on every dev/build cycle.
    reactDocgen: false,
  },
  viteFinal: (config) => {
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
