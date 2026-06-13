import {
  AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS,
  cssVarMapToInlineStyle,
  resolveActiveLaneCssVars,
} from "@repo/design-system";
import { Badge } from "@repo/ui/components/badge";
import { DesignSystemProvider } from "@repo/ui/components/provider";
import { fonts } from "@repo/ui/lib/fonts";
import type { Preview } from "@storybook/react";
import type { CSSProperties } from "react";

import "./preview.css";

function resolvePreviewTheme(context: {
  globals: { theme?: string };
  parameters: { forcedTheme?: string };
}): "dark" | "light" {
  if (
    context.parameters.forcedTheme === "dark" ||
    context.parameters.forcedTheme === "light"
  ) {
    return context.parameters.forcedTheme;
  }

  return context.globals.theme === "dark" ? "dark" : "light";
}

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
        { name: "dark", value: "var(--foreground)" },
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
          [
            "Introduction",
            ["Beastmode Keynote", "Mutation Orbit", "Command Surface"],
          ],
          "UI",
          ["UI", "Compose", "Form"],
          ["UI", "Compose", "Data"],
          ["UI", "Compose", "Navigation"],
          ["UI", "Compose", "Workspace"],
          ["UI", "Compose", "Feedback"],
          ["UI", "Compose Registry"],
          ["UI", "Primitives"],
          "Metadata UI",
          ["Metadata UI", "Overview"],
          "Theme Studio",
          "Workspace",
          ["Workspace", "Keyboard Shortcuts"],
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = resolvePreviewTheme(context);

      const activeFeatureId =
        typeof context.parameters.activeFeatureId === "string"
          ? context.parameters.activeFeatureId
          : undefined;
      const laneVars = activeFeatureId
        ? resolveActiveLaneCssVars(
            AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS,
            activeFeatureId,
            theme === "dark" ? "dark" : "light"
          )
        : {};
      const laneStyle = cssVarMapToInlineStyle(laneVars) as CSSProperties;

      return (
        <DesignSystemProvider
          attribute="class"
          defaultTheme={theme}
          disableTransitionOnChange
          enableSystem={false}
          forcedTheme={theme}
        >
          <div className={fonts}>
            <div
              className="min-h-screen bg-background text-foreground"
              style={laneStyle}
            >
              {activeFeatureId ? (
                <div className="border-lane-active-border border-b bg-lane-active-muted px-4 py-2">
                  <Badge variant="lane">
                    Lane: {laneVars["--lane-active-id"] ?? "default"} (
                    {activeFeatureId})
                  </Badge>
                </div>
              ) : null}
              <Story />
            </div>
          </div>
        </DesignSystemProvider>
      );
    },
  ],
};

export default preview;
