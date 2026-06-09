import type { ReactElement } from "react";

import type { MetadataActionRendererProps } from "../../contracts/action-renderer.contract";
import { BaseActionRenderer } from "./base-action.renderer";

export function ButtonActionRenderer(
  props: MetadataActionRendererProps
): ReactElement {
  return <BaseActionRenderer {...props} variant="default" />;
}
