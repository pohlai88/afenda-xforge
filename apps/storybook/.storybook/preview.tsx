import type { Preview } from "@storybook/react";

import "./preview.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Global color theme",
      toolbar: {
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  parameters: {
    controls: {
      expanded: true,
    },
    options: {
      storySort: { order: ["Introduction"] },
    },
  },
  decorators: [
    (Story, context) => (
      <div
        className={[
          "min-h-screen bg-background text-foreground",
          context.globals.theme === "dark" ? "dark" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
