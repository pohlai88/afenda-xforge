import type { ReactElement } from "react";

import type { MetadataActionRendererProps } from "../../contracts/action-renderer.contract";
import { resolveActionVisualDefinition } from "./action-visual-matrix";
import { BaseActionRenderer } from "./base-action.renderer";

export function DestructiveActionRenderer(
  props: MetadataActionRendererProps
): ReactElement {
  return (
    <BaseActionRenderer
      {...props}
      visual={resolveActionVisualDefinition("destructive")}
    />
  );
}
