import assert from "node:assert/strict";
import test from "node:test";
import type { WebhookEnvelope } from "../outbound/delivery.ts";
import {
  buildSvixMessageRequest,
  publishSvixWebhook,
} from "../outbound/publisher.ts";
import { createEventRegistry } from "../registry/event-registry.ts";
import { createSchemaRegistry } from "../registry/schema-registry.ts";

const sampleEnvelope: WebhookEnvelope = {
  eventId: "evt_1",
  eventType: "customer.created.v1",
  occurredAt: "2026-06-09T00:00:00.000Z",
  operationId: "op_1",
  payload: {
    customerId: "cus_1",
  },
  redactionPolicy: "standard",
  requestId: "req_1",
  schemaVersion: "v1",
  tenantId: "tenant_1",
};

test("buildSvixMessageRequest rejects missing tenant and operation fields", () => {
  assert.throws(
    () =>
      buildSvixMessageRequest({
        applicationId: "app_1",
        envelope: {
          ...sampleEnvelope,
          operationId: "",
          tenantId: "",
        },
        eventRegistry: createEventRegistry([
          {
            eventType: "customer.created.v1",
            owner: "customers",
            schemaVersion: "v1",
            scopes: ["tenant"],
            sensitivity: "standard",
            state: "active",
          },
        ]),
        schemaRegistry: createSchemaRegistry([
          {
            eventType: "customer.created.v1",
            schemaVersion: "v1",
            validate: (payload: unknown): payload is Record<string, unknown> =>
              typeof payload === "object" && payload !== null,
          },
        ]),
      }),
    /tenantId is required/
  );
});

test("publishSvixWebhook forwards the expected event type and payload", async () => {
  const calls: unknown[] = [];
  const client = {
    create: (
      applicationId: string,
      request: unknown
    ): Promise<{ applicationId: string; request: unknown }> => {
      calls.push({ applicationId, request });

      return Promise.resolve({
        applicationId,
        request,
      });
    },
  };

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
        typeof payload === "object" &&
        payload !== null &&
        "customerId" in payload,
    },
  ]);

  await publishSvixWebhook(client, {
    applicationId: "app_1",
    envelope: sampleEnvelope,
    eventRegistry,
    schemaRegistry,
  });

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], {
    applicationId: "app_1",
    request: {
      application: {
        name: "app_1",
        uid: "app_1",
      },
      eventType: "customer.created.v1",
      payload: {
        customerId: "cus_1",
        companyId: undefined,
        eventId: "evt_1",
        eventType: "customer.created.v1",
        occurredAt: "2026-06-09T00:00:00.000Z",
        operationId: "op_1",
        organizationId: undefined,
        redactionPolicy: "standard",
        requestId: "req_1",
        schemaVersion: "v1",
        tenantId: "tenant_1",
        workspaceId: undefined,
      },
    },
  });
});
