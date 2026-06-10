import assert from "node:assert/strict";
import type { ReactElement } from "react";

import {
  renderMetadataAction,
  renderMetadataField,
  renderMetadataSection,
  renderMetadataState,
  renderMetadataTableCellResult,
} from "../src/adapters";
import type { MetadataActionContract } from "../src/contracts/action-renderer.contract";
import type { MetadataFieldContract } from "../src/contracts/field-renderer.contract";
import type { MetadataRenderContext } from "../src/contracts/render-context.contract";
import { createMetadataRenderContext } from "../src/contracts/render-context.defaults";
import type { MetadataSectionContract } from "../src/contracts/section-renderer.contract";
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

test("renderMetadataTableCellResult routes status cells through field registry", () => {
  const result = renderMetadataTableCellResult({
    column: {
      key: "status",
      kind: "status",
      label: "Status",
    },
    context: {
      locale: "en",
      timezone: "UTC",
    },
    value: "active",
  });

  assert.equal((result.element as TestElement).type.name, "StatusBadge");
  assert.equal((result.element as TestElement).props.tone, "success");
  assert.equal(result.diagnostics.length >= 0, true);
});

test("renderMetadataTableCellResult routes email cells through field registry", () => {
  const result = renderMetadataTableCellResult({
    column: {
      key: "email",
      kind: "email",
      label: "Email",
    },
    context: {
      locale: "en",
      timezone: "UTC",
    },
    value: "hello@example.com",
  });

  assert.equal((result.element as TestElement).type, "a");
  assert.equal(
    (result.element as TestElement).props.href,
    "mailto:hello@example.com"
  );
});

test("renderMetadataSection returns diagnostics through section adapter", () => {
  const telemetry = createTelemetrySink();
  const context: MetadataRenderContext = createMetadataRenderContext(
    {
      permissions: {},
      telemetry: telemetry.sink,
    },
    {
      mode: "read",
    }
  );

  const section: MetadataSectionContract = {
    key: "summary",
    kind: "form",
    permission: "employee.read",
    title: "Summary",
  };

  const result = renderMetadataSection({
    context,
    section,
  });

  assert.equal((result.element as TestElement).type.name, "ForbiddenState");
  assert.equal(result.diagnostics.length > 0, true);
  assert.deepEqual(
    telemetry.events.map((event) => event.name),
    ["metadata.section.render.started", "metadata.renderer.fallback"]
  );
});

test("renderMetadataAction and renderMetadataState remain adapter-owned surfaces", () => {
  const action: MetadataActionContract = {
    key: "save",
    kind: "update",
    label: "Save",
    permission: "employee.write",
  };

  const actionResult = renderMetadataAction({
    context: createMetadataRenderContext(undefined, { mode: "create" }),
    action,
  });

  assert.equal(
    (actionResult.element as TestElement).type.name,
    "ForbiddenState"
  );

  const stateResult = renderMetadataState({
    context: createMetadataRenderContext(undefined, { state: "loading" }),
    state: "loading",
  });

  assert.equal((stateResult.element as TestElement).type.name, "LoadingState");
});

test("renderMetadataField registry path covers table money cells", () => {
  const field: MetadataFieldContract = {
    key: "amount",
    kind: "money",
    label: "Amount",
  };

  const result = renderMetadataField({
    context: createMetadataRenderContext(
      {
        locale: "en-US",
        timezone: "UTC",
      },
      {
        mode: "read",
        surfaceRole: "table-cell",
      }
    ),
    field,
    value: 1234.5,
  });

  assert.equal((result.element as TestElement).type, "span");
  assert.match(String((result.element as TestElement).props.children), /\$/);
});
