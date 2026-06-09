import assert from "node:assert/strict";
import test from "node:test";

import { redactSensitiveData } from "../security/redaction.ts";

test("redactSensitiveData removes sensitive fields from logs", () => {
  assert.deepEqual(
    redactSensitiveData({
      nested: {
        token: "abc",
      },
      payload: {
        customerId: "cus_1",
      },
      signature: "deadbeef",
    }),
    {
      nested: {
        token: "[redacted]",
      },
      payload: {
        customerId: "cus_1",
      },
      signature: "[redacted]",
    }
  );
});
