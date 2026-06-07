import { ThemeProvider } from "@repo/design-system";
import type { Decorator, Preview } from "@storybook/react";
import type { ReactElement } from "react";

type StoryTheme = "dark" | "light" | "system";

const resolveStoryTheme = (value: unknown): StoryTheme => {
  if (value === "dark" || value === "light" || value === "system") {
    return value;
  }

  return "system";
};

type StoryDecorator = Decorator;
type StoryDecoratorFn = Parameters<StoryDecorator>[0];
type StoryDecoratorContext = Parameters<StoryDecorator>[1];

const preview: Preview = {
  decorators: [
    (Story: StoryDecoratorFn, context: StoryDecoratorContext): ReactElement => {
      const theme = resolveStoryTheme(context.parameters.theme);
      const themeProps =
        theme === "system"
          ? {
              defaultTheme: "system" as const,
            }
          : {
              defaultTheme: theme,
              forcedTheme: theme,
            };

      return (
        <ThemeProvider {...themeProps}>
          <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-8 px-6 py-8">
              {Story()}
            </div>
          </div>
        </ThemeProvider>
      );
    },
  ],
  parameters: {
    layout: "fullscreen",
  },
};

export default preview;
