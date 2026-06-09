import type { WebhookRedactionPolicy } from "../outbound/delivery.ts";

export type WebhookEventScope =
  | "tenant"
  | "organization"
  | "company"
  | "workspace";

export type WebhookContractState =
  | "draft"
  | "active"
  | "deprecated"
  | "retired";

export type RegisteredWebhookEvent = Readonly<{
  eventType: string;
  owner: string;
  schemaVersion: string;
  scopes: readonly WebhookEventScope[];
  sensitivity: WebhookRedactionPolicy;
  state: WebhookContractState;
}>;

export type WebhookEventRegistry = ReadonlyMap<string, RegisteredWebhookEvent>;

export const createEventRegistry = (
  events: readonly RegisteredWebhookEvent[]
): WebhookEventRegistry => {
  const registry = new Map<string, RegisteredWebhookEvent>();

  for (const event of events) {
    if (registry.has(event.eventType)) {
      throw new Error(`Duplicate webhook event type: ${event.eventType}`);
    }

    registry.set(event.eventType, event);
  }

  return registry;
};

export const getRegisteredEvent = (
  registry: WebhookEventRegistry,
  eventType: string
): RegisteredWebhookEvent | null => registry.get(eventType) ?? null;

export const assertRegisteredEvent = (
  registry: WebhookEventRegistry,
  eventType: string
): RegisteredWebhookEvent => {
  const registeredEvent = getRegisteredEvent(registry, eventType);

  if (!registeredEvent) {
    throw new Error(`Unknown webhook event type: ${eventType}`);
  }

  return registeredEvent;
};
