import { createMetadataRenderContext } from "@repo/metadata-ui";
import type { ReactNode } from "react";

export const metadataUiStoryContext = createMetadataRenderContext(
  {
    featureFlags: {
      "billing-editor": true,
    },
    permissions: {
      "invoice.update": true,
    },
    surfaceId: "storybook/metadata-ui",
  },
  {
    mode: "review",
    routeId: "storybook/metadata-ui",
    surfaceId: "storybook/metadata-ui",
  }
);

export const metadataUiStoryParameters = {
  layout: "fullscreen" as const,
  a11y: {
    test: "error" as const,
  },
};

export function MetadataUiStoryFrame({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl p-6 md:p-10">{children}</div>;
}
