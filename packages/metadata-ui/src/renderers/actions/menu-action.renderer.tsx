import type { ReactElement } from "react";

import type { MetadataActionRendererProps } from "../../contracts/action-renderer.contract";
import { MenuActionSurface } from "./menu-action-surface";

export function MenuActionRenderer(
  props: MetadataActionRendererProps
): ReactElement {
  return <MenuActionSurface {...props} />;
}
