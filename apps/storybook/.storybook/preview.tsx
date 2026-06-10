import { DesignSystemProvider } from "@repo/ui/components/provider";
import { fonts } from "@repo/ui/lib/fonts";
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
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
    backgrounds: {
      default: "surface",
      values: [
        { name: "surface", value: "var(--background)" },
        { name: "card", value: "var(--card)" },
        { name: "dark", value: "oklch(0.205 0.018 264)" },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: "Mobile",
          styles: { width: "375px", height: "667px" },
          type: "mobile",
        },
        tablet: {
          name: "Tablet",
          styles: { width: "768px", height: "1024px" },
          type: "tablet",
        },
        desktop: {
          name: "Desktop",
          styles: { width: "1440px", height: "900px" },
          type: "desktop",
        },
      },
    },
    a11y: {
      context: "#storybook-root",
      config: {
        rules: [
          { id: "color-contrast", enabled: true },
          { id: "label", enabled: true },
        ],
      },
      test: "todo",
    },
    options: {
      storySort: {
        order: [
          "Introduction",
          ["Introduction", ["Beastmode Keynote", "Mutation Orbit", "Command Surface"]],
          "UI",
          ["UI", "Compose", "Form"],
          ["UI", "Compose", "Data"],
          ["UI", "Compose", "Navigation"],
          ["UI", "Compose", "Feedback"],
          ["UI", "Compose Registry"],
          ["UI", "Primitives"],
          "Metadata UI",
          ["Metadata UI", "Overview"],
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme =
        context.parameters.forcedTheme === "dark" ||
        context.parameters.forcedTheme === "light"
          ? context.parameters.forcedTheme
          : context.globals.theme === "dark"
            ? "dark"
            : "light";

      return (
        <DesignSystemProvider
          attribute="class"
          defaultTheme={theme}
          disableTransitionOnChange
          enableSystem={false}
          forcedTheme={theme}
        >
          <div className={fonts}>
            <div className="min-h-screen bg-background text-foreground">
              <Story />
            </div>
          </div>
        </DesignSystemProvider>
      );
    },
  ],
};

export default preview;
