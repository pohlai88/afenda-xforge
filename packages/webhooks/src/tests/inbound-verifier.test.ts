import assert from "node:assert/strict";
import test from "node:test";
import { verifyInboundWebhook } from "../inbound/verifier.ts";
import { createHmacSignature } from "../security/signatures.ts";

test("verifyInboundWebhook accepts a valid signature", () => {
  const rawBody = JSON.stringify({ ok: true });
  const secret = "super-secret";
  const signature = createHmacSignature(secret, rawBody).toString("hex");

  assert.equal(
    verifyInboundWebhook(
      {
        eventId: "evt_1",
        eventType: "customer.created.v1",
        payload: { ok: true },
        provider: "svix",
        rawBody,
        signature,
        timestamp: Date.now(),
      },
      secret
    ),
    true
  );
});

test("verifyInboundWebhook rejects an invalid signature", () => {
  assert.equal(
    verifyInboundWebhook(
      {
        eventId: "evt_1",
        eventType: "customer.created.v1",
        payload: { ok: true },
        provider: "svix",
        rawBody: JSON.stringify({ ok: true }),
        signature: "deadbeef",
        timestamp: Date.now(),
      },
      "super-secret"
    ),
    false
  );
});
