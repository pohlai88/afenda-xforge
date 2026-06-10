import assert from "node:assert/strict";
import type { ReactElement } from "react";

import {
  renderMetadataAction,
  renderMetadataField,
  renderMetadataState,
} from "../src/adapters";
import type { MetadataActionContract } from "../src/contracts/action-renderer.contract";
import type { MetadataFieldContract } from "../src/contracts/field-renderer.contract";
import type { MetadataRenderContext } from "../src/contracts/render-context.contract";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import { test } from "./test-runtime";

type TestElement = ReactElement<any, any>;

const createTelemetrySink = (): {
  events: Array<{ name: string }>;
  sink: {
    emit: (event: { name: string }) => void;
  };
} => {
  const events: Array<{ name: string }> = [];

  return {
    events,
    sink: {
      emit: (event: { name: string }): void => {
        events.push({ name: event.name });
      },
    },
  };
};

test("renderMetadataField returns diagnostics and emits telemetry on governance denial", () => {
  const telemetry = createTelemetrySink();
  const context: MetadataRenderContext = createMetadataRenderContext(
    {
      permissions: {},
      telemetry: telemetry.sink,
    },
    {
      mode: "create",
    }
  );

  const field: MetadataFieldContract = {
    key: "employeeStatus",
    label: "Status",
    kind: "text",
    permission: "employee.write",
  };

  const result = renderMetadataField({
    context,
    field,
    value: "active",
  });

  assert.equal((result.element as TestElement).type.name, "ForbiddenState");
  assert.equal(result.diagnostics.length > 0, true);
  assert.equal(result.diagnostics[0]?.code, "missing-permission");
  assert.deepEqual(
    telemetry.events.map((event) => event.name),
    ["metadata.field.render.started", "metadata.renderer.fallback"]
  );
  assert.equal(result.diagnostics[0]?.correlationId, context.correlationId);
});

test("renderMetadataState returns diagnostics and emits telemetry", () => {
  const telemetry = createTelemetrySink();

  const result = renderMetadataState({
    context: {
      telemetry: telemetry.sink,
    },
    state: "mystery",
  });

  assert.equal((result.element as TestElement).type.name, "ErrorState");
  assert.equal(result.diagnostics.length > 0, true);
  assert.equal(result.diagnostics[0]?.code, "unsupported-state");
  assert.deepEqual(
    telemetry.events.map((event) => event.name),
    ["metadata.state.render.started", "metadata.renderer.fallback"]
  );
});

test("renderMetadataAction honors hide fallback without rendering forbidden chrome", () => {
  const context = createMetadataRenderContext(
    {
      permissions: {},
    },
    {
      mode: "read",
    }
  );
  const action: MetadataActionContract = {
    fallback: "hide",
    key: "archive",
    kind: "archive",
    label: "Archive",
    permission: "employee.archive",
  };

  const result = renderMetadataAction({
    action,
    context,
  });

  assert.equal(result.element, null);
  assert.equal(result.diagnostics[0]?.code, "missing-permission");
});

test("renderMetadataField supports governance fallback matrix for permission denial", () => {
  const fallbackExpectations = [
    {
      effect: "disable" as const,
      fallback: "disable" as const,
      expectedElement: "MetadataFieldShell",
    },
    {
      effect: "readonly" as const,
      fallback: "readonly" as const,
      expectedElement: "MetadataFieldShell",
    },
    {
      effect: "hide" as const,
      fallback: "hide" as const,
      expectedElement: null,
    },
    {
      effect: "forbidden" as const,
      fallback: "forbidden" as const,
      expectedElement: "ForbiddenState",
    },
  ];

  for (const expectation of fallbackExpectations) {
    const context = createMetadataRenderContext(
      {
        permissions: {},
      },
      {
        mode: "update",
      }
    );
    const field: MetadataFieldContract = {
      fallback: expectation.fallback,
      key: `field-${expectation.effect}`,
      kind: "text",
      label: `Field ${expectation.effect}`,
      permission: "employee.write",
    };

    const result = renderMetadataField({
      context,
      field,
      value: "active",
    });

    assert.equal(result.diagnostics[0]?.code, "missing-permission");

    if (expectation.expectedElement === null) {
      assert.equal(result.element, null);
      continue;
    }

    const element = result.element as TestElement;
    const elementType =
      typeof element.type === "string" ? element.type : element.type.name;

    assert.equal(elementType, expectation.expectedElement);
  }
});
