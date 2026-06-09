import type { ReactElement } from "react";

import type {
  MetadataActionContract,
  MetadataActionRenderer,
} from "../contracts/action-renderer.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import { defaultActionRegistry } from "../registry/default-action-registry";

export type MetadataActionAdapterProps = {
  action: MetadataActionContract;
  context: MetadataRenderContext;
  onAction?: (action: MetadataActionContract) => void;
  registry?: typeof defaultActionRegistry;
};

export function renderMetadataAction({
  action,
  context,
  onAction,
  registry = defaultActionRegistry,
}: MetadataActionAdapterProps): ReactElement | null {
  const actionRenderer = registry.get(
    action.kind ?? "button"
  ) as MetadataActionRenderer;

  return actionRenderer({
    action,
    context,
    onAction,
  });
}
