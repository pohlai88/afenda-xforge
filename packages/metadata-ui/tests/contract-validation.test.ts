import assert from "node:assert/strict";

import {
  validateMetadataActionContract,
  validateMetadataFieldContract,
  validateMetadataSectionContract,
} from "../src/adapters/contract-validation";
import { test } from "./test-runtime";

test("validateMetadataFieldContract rejects unsupported kind", () => {
  const result = validateMetadataFieldContract({
    key: "amount",
    kind: "currency" as never,
    label: "Amount",
  });

  assert.equal(result.valid, false);
  assert.equal(result.diagnostic?.code, "invalid-contract");
  assert.match(String(result.diagnostic?.message ?? ""), /unsupported kind/);
});

test("validateMetadataFieldContract requires select options", () => {
  const result = validateMetadataFieldContract({
    key: "status",
    kind: "select",
    label: "Status",
  });

  assert.equal(result.valid, false);
  assert.match(
    String(result.diagnostic?.message ?? ""),
    /requires at least one option/
  );
});

test("validateMetadataActionContract requires a non-empty kind", () => {
  const result = validateMetadataActionContract({
    key: "save",
    kind: "" as never,
    label: "Save",
  });

  assert.equal(result.valid, false);
  assert.match(
    String(result.diagnostic?.message ?? ""),
    /requires a non-empty kind/
  );
});

test("validateMetadataActionContract validates confirmationPolicy message", () => {
  const result = validateMetadataActionContract({
    confirmationPolicy: {
      message: "",
    },
    key: "delete",
    kind: "delete",
    label: "Delete",
  });

  assert.equal(result.valid, false);
  assert.match(
    String(result.diagnostic?.message ?? ""),
    /confirmationPolicy requires a non-empty message/
  );
});

test("validateMetadataSectionContract validates nested field contracts", () => {
  const result = validateMetadataSectionContract({
    fields: [
      {
        key: "",
        kind: "text",
        label: "Name",
      },
    ],
    key: "summary",
    kind: "form",
    title: "Summary",
  });

  assert.equal(result.valid, false);
  assert.equal(result.diagnostic?.code, "invalid-contract");
});

test("validateMetadataSectionContract validates row ids", () => {
  const result = validateMetadataSectionContract({
    key: "records",
    kind: "table",
    rows: [{ id: "" }],
    title: "Records",
  });

  assert.equal(result.valid, false);
  assert.match(String(result.diagnostic?.message ?? ""), /row at index/);
});
