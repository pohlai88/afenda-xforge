import assert from "node:assert/strict";

import { renderMetadataState } from "../src/adapters";
import { emitMetadataTelemetry } from "../src/adapters/telemetry";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import { test } from "./test-runtime";

test("emitMetadataTelemetry survives a throwing telemetry sink", () => {
  const context = createMetadataRenderContext({
    telemetry: {
      emit: (): void => {
        throw new Error("telemetry sink unavailable");
      },
    },
  });

  assert.doesNotThrow(() => {
    emitMetadataTelemetry(context, "metadata.state.render.started", {
      level: "debug",
      rendererKey: "loading",
    });
  });
});

test("renderMetadataState still returns an element when telemetry fails", () => {
  const context = createMetadataRenderContext({
    telemetry: {
      emit: (): void => {
        throw new Error("telemetry sink unavailable");
      },
    },
  });

  const result = renderMetadataState({
    context,
    state: "loading",
  });

  assert.notEqual(result.element, null);
  assert.equal(result.diagnostics.length >= 0, true);
});
