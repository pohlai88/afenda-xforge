import type { ReactElement } from "react";

import type { MetadataRenderContext } from "../contracts/render-context.contract";
import { InvalidState } from "../renderers/states/invalid-state.renderer";
import type { MetadataRenderAdapterResult } from "./adapter-result";
import type { MetadataRendererDiagnostic } from "./diagnostics";
import { emitMetadataTelemetry } from "./telemetry.ts";

export function createInvalidContractFallbackResult(
  context: MetadataRenderContext,
  diagnostic: MetadataRendererDiagnostic,
  title: string,
  telemetry: {
    attributes: Record<string, string | boolean | number | undefined>;
    rendererKey: string;
  }
): MetadataRenderAdapterResult<ReactElement> {
  emitMetadataTelemetry(context, "metadata.renderer.fallback", {
    attributes: {
      reason: diagnostic.code,
      ...telemetry.attributes,
    },
    diagnostics: [diagnostic],
    level: "error",
    rendererKey: telemetry.rendererKey,
  });

  return {
    diagnostics: [diagnostic],
    element: <InvalidState description={diagnostic.message} title={title} />,
  };
}
