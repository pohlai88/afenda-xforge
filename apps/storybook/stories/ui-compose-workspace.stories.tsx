import type { Meta, StoryObj } from "@storybook/react";
import { lazy, Suspense } from "react";

const LazyFullShellFrame = lazy(() =>
  import(
    "../../../packages/ui/src/components/compose/workspace/7.0-workspace-full-shell-pattern"
  ).then((module) => ({ default: module.WorkspaceFullShellFrame }))
);

const LazyWorkspaceComposeGallery = lazy(() =>
  import(
    "../../../packages/ui/src/components/compose/workspace/7.1-workspace-compose-gallery"
  ).then((module) => ({ default: module.WorkspaceComposeGallery }))
);

const meta = {
  title: "UI/Compose/Workspace",
  parameters: {
    layout: "fullscreen",
    a11y: { test: "todo" as const },
    docs: {
      description: {
        component:
          "Workspace chrome patterns (1.x–7.x): app topbar, sidebar rail, nav switchers, site column, full shell, and compose gallery. Registered in the compose registry as `workspace`.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function GalleryLoading() {
  return (
    <div className="p-10 text-muted-foreground text-sm">Loading gallery…</div>
  );
}

export const Gallery: Story = {
  parameters: {
    layout: "fullscreen",
    a11y: { test: "todo" as const },
  },
  render: () => (
    <div className="min-h-svh w-full max-w-none bg-background px-6 py-8 md:px-8">
      <Suspense fallback={<GalleryLoading />}>
        <LazyWorkspaceComposeGallery />
      </Suspense>
    </div>
  ),
};

export const FullShell: Story = {
  parameters: {
    layout: "fullscreen",
    a11y: { test: "todo" as const },
    docs: {
      description: {
        story:
          "Immersive full-viewport shell preview for layout QA outside the stacked gallery.",
      },
    },
  },
  render: () => (
    <Suspense
      fallback={
        <div className="p-10 text-muted-foreground text-sm">Loading…</div>
      }
    >
      <LazyFullShellFrame />
    </Suspense>
  ),
};
