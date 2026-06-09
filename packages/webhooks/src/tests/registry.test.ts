import assert from "node:assert/strict";
import test from "node:test";

import {
  assertRegisteredEvent,
  createEventRegistry,
} from "../registry/event-registry.ts";
import {
  assertRegisteredSchema,
  createSchemaRegistry,
} from "../registry/schema-registry.ts";

test("registry rejects unknown event types and unsupported versions", () => {
  const eventRegistry = createEventRegistry([
    {
      eventType: "customer.created.v1",
      owner: "customers",
      schemaVersion: "v1",
      scopes: ["tenant"],
      sensitivity: "standard",
      state: "active",
    },
  ]);

  const schemaRegistry = createSchemaRegistry([
    {
      eventType: "customer.created.v1",
      schemaVersion: "v1",
      validate: (payload: unknown): payload is Record<string, unknown> =>
        typeof payload === "object" && payload !== null,
    },
  ]);

  assert.throws(() =>
    assertRegisteredEvent(eventRegistry, "customer.deleted.v1")
  );
  assert.throws(() =>
    assertRegisteredSchema(schemaRegistry, "customer.created.v1", "v2")
  );
});
