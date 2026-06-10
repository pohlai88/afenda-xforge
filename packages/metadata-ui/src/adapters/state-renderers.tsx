import type { ReactElement } from "react";

import type {
  MetadataStateRenderer,
  MetadataStateRendererProps,
} from "../contracts/state-renderer.contract";
import { defaultStateRegistry } from "../registry/default-state-registry";
import { ErrorState } from "../renderers/states/error-state.renderer";
import type { MetadataRendererDiagnostic } from "./diagnostics";

export const metadataUiStateKeys = defaultStateRegistry.keys();

export const createMissingStateRenderer = (
  diagnostic: MetadataRendererDiagnostic
): MetadataStateRenderer =>
  function MissingStateRenderer({
    onRetry,
  }: MetadataStateRendererProps): ReactElement {
    return (
      <ErrorState
        description={diagnostic.message}
        onRetry={onRetry}
        title="Unsupported metadata state"
      />
    );
  };

export const stateRenderers: Partial<Record<string, MetadataStateRenderer>> =
  Object.fromEntries(
    defaultStateRegistry.keys().map((key) => {
      const registration = defaultStateRegistry.resolve(key);

      return [key, registration?.renderer];
    })
  );
