import type { WebhookPayload } from "../contract.ts";
import { assertRegisteredEvent } from "../registry/event-registry.ts";
import type {
  WebhookEventRegistry,
  WebhookSchemaRegistry,
} from "../registry/index.ts";
import { assertRegisteredSchema } from "../registry/schema-registry.ts";
import type { WebhookEnvelope } from "./delivery.ts";
import { validateWebhookEnvelope } from "./delivery.ts";

export type SvixMessageClient = Readonly<{
  create: (
    applicationId: string,
    request: {
      application: {
        name: string;
        uid: string;
      };
      eventType: string;
      payload: WebhookPayload;
    }
  ) => Promise<unknown>;
}>;

export type PublishSvixWebhookInput = Readonly<{
  applicationId: string;
  applicationName?: string;
  envelope: WebhookEnvelope;
  eventRegistry: WebhookEventRegistry;
  schemaRegistry: WebhookSchemaRegistry;
}>;

export const buildSvixMessageRequest = ({
  applicationId,
  applicationName = applicationId,
  envelope,
  eventRegistry,
  schemaRegistry,
}: PublishSvixWebhookInput): {
  application: {
    name: string;
    uid: string;
  };
  eventType: string;
  payload: WebhookPayload;
} => {
  const validatedEnvelope = validateWebhookEnvelope(envelope);
  const registeredEvent = assertRegisteredEvent(
    eventRegistry,
    validatedEnvelope.eventType
  );
  const registeredSchema = assertRegisteredSchema(
    schemaRegistry,
    validatedEnvelope.eventType,
    validatedEnvelope.schemaVersion
  );

  if (registeredEvent.schemaVersion !== registeredSchema.schemaVersion) {
    throw new Error(
      `Webhook schema version mismatch for event type: ${validatedEnvelope.eventType}`
    );
  }

  if (!registeredSchema.validate(validatedEnvelope.payload)) {
    throw new Error(
      `Webhook payload validation failed for event type: ${validatedEnvelope.eventType}`
    );
  }

  return {
    application: {
      name: applicationName,
      uid: applicationId,
    },
    eventType: validatedEnvelope.eventType,
    payload: {
      ...validatedEnvelope.payload,
      companyId: validatedEnvelope.companyId,
      eventId: validatedEnvelope.eventId,
      eventType: validatedEnvelope.eventType,
      occurredAt: validatedEnvelope.occurredAt,
      operationId: validatedEnvelope.operationId,
      organizationId: validatedEnvelope.organizationId,
      redactionPolicy: validatedEnvelope.redactionPolicy,
      requestId: validatedEnvelope.requestId,
      schemaVersion: validatedEnvelope.schemaVersion,
      tenantId: validatedEnvelope.tenantId,
      workspaceId: validatedEnvelope.workspaceId,
    },
  };
};

export const publishSvixWebhook = async (
  client: SvixMessageClient,
  input: PublishSvixWebhookInput
): Promise<unknown> =>
  client.create(
    input.applicationId,
    buildSvixMessageRequest({
      applicationId: input.applicationId,
      applicationName: input.applicationName,
      envelope: input.envelope,
      eventRegistry: input.eventRegistry,
      schemaRegistry: input.schemaRegistry,
    })
  );
