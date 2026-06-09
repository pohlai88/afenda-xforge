import type { WebhookPayload } from "../contract.ts";

export type WebhookPayloadValidator<TPayload extends WebhookPayload> = (
  payload: unknown
) => payload is TPayload;

export type RegisteredWebhookSchema<TPayload extends WebhookPayload> =
  Readonly<{
    eventType: string;
    schemaVersion: string;
    validate: WebhookPayloadValidator<TPayload>;
  }>;

export type AnyRegisteredWebhookSchema =
  RegisteredWebhookSchema<WebhookPayload>;

export type WebhookSchemaRegistry = ReadonlyMap<
  string,
  AnyRegisteredWebhookSchema
>;

const createSchemaKey = (eventType: string, schemaVersion: string): string =>
  `${eventType}@${schemaVersion}`;

export const createSchemaRegistry = (
  schemas: readonly AnyRegisteredWebhookSchema[]
): WebhookSchemaRegistry => {
  const registry = new Map<string, AnyRegisteredWebhookSchema>();

  for (const schema of schemas) {
    const registryKey = createSchemaKey(schema.eventType, schema.schemaVersion);

    if (registry.has(registryKey)) {
      throw new Error(`Duplicate webhook schema: ${registryKey}`);
    }

    registry.set(registryKey, schema);
  }

  return registry;
};

export const getRegisteredSchema = (
  registry: WebhookSchemaRegistry,
  eventType: string,
  schemaVersion: string
): AnyRegisteredWebhookSchema | null =>
  registry.get(createSchemaKey(eventType, schemaVersion)) ?? null;

export const assertRegisteredSchema = (
  registry: WebhookSchemaRegistry,
  eventType: string,
  schemaVersion: string
): AnyRegisteredWebhookSchema => {
  const registeredSchema = getRegisteredSchema(
    registry,
    eventType,
    schemaVersion
  );

  if (!registeredSchema) {
    throw new Error(
      `Unknown webhook schema: ${createSchemaKey(eventType, schemaVersion)}`
    );
  }

  return registeredSchema;
};
