import assert from "node:assert/strict";
import test from "node:test";

import { metadataActionSchema } from "../schemas/action.schema.ts";

test("metadataActionSchema parses a valid action contract", () => {
  const action = metadataActionSchema.parse({
    customization: {
      label: true,
      placement: true,
      safe: true,
    },
    key: "approve",
    label: "Approve",
    kind: "approve",
    confirmMessage: "Approve this record?",
    description: "Moves the record into the approved state.",
    dangerous: false,
    placement: "primary",
    requiresSelection: true,
    stateTransition: {
      from: ["pending"],
      to: "approved",
    },
  });

  assert.equal(action.kind, "approve");
  assert.equal(action.customization?.safe, true);
  assert.equal(action.placement, "primary");
  assert.deepEqual(action.stateTransition?.from, ["pending"]);
});

test("metadataActionSchema rejects unsupported action kinds", () => {
  assert.throws(() => {
    metadataActionSchema.parse({
      key: "publish",
      label: "Publish",
      kind: "publish",
    });
  });
});

test("metadataActionSchema rejects unknown customization policy keys", () => {
  assert.throws(() => {
    metadataActionSchema.parse({
      customization: {
        safe: true,
        tone: true,
      },
      key: "approve",
      label: "Approve",
      kind: "approve",
    });
  });
});
