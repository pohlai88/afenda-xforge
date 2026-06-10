import assert from "node:assert/strict";
import test from "node:test";

import { metadataFieldSchema } from "../schemas/field.schema.ts";

test("metadataFieldSchema parses a valid field contract", () => {
  const field = metadataFieldSchema.parse({
    customization: {
      hidden: "allow",
      label: true,
      order: true,
      placeholder: true,
    },
    id: "customer.records.fields.status",
    key: "status",
    label: "Status",
    kind: "select",
    required: true,
    description: "Lifecycle state for the record.",
    placeholder: "Choose a status",
    permissionHint: "crm.customer.status",
    validationHint: "Must be one of the supported workflow states.",
  });

  assert.equal(field.kind, "select");
  assert.equal(field.customization?.hidden, "allow");
  assert.equal(field.required, true);
  assert.equal(field.id, "customer.records.fields.status");
  assert.equal(field.key, "status");
});

test("metadataFieldSchema rejects unsupported field kinds", () => {
  assert.throws(() => {
    metadataFieldSchema.parse({
      key: "status",
      label: "Status",
      kind: "email",
    });
  });
});

test("metadataFieldSchema rejects invalid customization policy values", () => {
  assert.throws(() => {
    metadataFieldSchema.parse({
      customization: {
        hidden: "sometimes",
      },
      key: "status",
      label: "Status",
      kind: "select",
    });
  });
});
