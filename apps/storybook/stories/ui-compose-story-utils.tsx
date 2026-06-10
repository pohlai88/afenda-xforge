import type { ComponentType, ReactNode } from "react";

export function GalleryFrame({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl p-6 md:p-10">{children}</div>;
}

export function galleryStory(
  Gallery: ComponentType,
  a11yTest: "error" | "todo" = "todo"
) {
  return {
    parameters: { a11y: { test: a11yTest } },
    render: () => (
      <GalleryFrame>
        <Gallery />
      </GalleryFrame>
    ),
  };
}
