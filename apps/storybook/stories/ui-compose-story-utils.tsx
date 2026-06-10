import {
  lazy,
  Suspense,
  type ComponentType,
  type ReactNode,
} from "react";

export function GalleryFrame({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl p-6 md:p-10">{children}</div>;
}

function GalleryLoading() {
  return (
    <div className="p-10 text-muted-foreground text-sm">Loading gallery…</div>
  );
}

export function lazyGalleryStory(
  loadGallery: () => Promise<{ default: ComponentType }>,
  a11yTest: "error" | "todo" = "todo"
) {
  const LazyGallery = lazy(loadGallery);

  return {
    parameters: { a11y: { test: a11yTest } },
    render: () => (
      <GalleryFrame>
        <Suspense fallback={<GalleryLoading />}>
          <LazyGallery />
        </Suspense>
      </GalleryFrame>
    ),
  };
}

/** @deprecated Use lazyGalleryStory for codegen compose galleries. */
export function galleryStory(
  Gallery: ComponentType,
  a11yTest: "error" | "todo" = "todo"
) {
  return lazyGalleryStory(
    () => Promise.resolve({ default: Gallery }),
    a11yTest
  );
}
