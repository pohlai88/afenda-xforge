import type { ReactElement } from "react";

import type { MetadataRenderContext } from "./render-context.contract";

export type MetadataRendererContract<TContract> = {
  contract: TContract;
  context: MetadataRenderContext;
};

export type MetadataRenderer<TContract> = (
  props: MetadataRendererContract<TContract>
) => ReactElement | null;
