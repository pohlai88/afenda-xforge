export type InboundWebhookEnvelope = Readonly<{
  eventId: string;
  eventType: string;
  payload: unknown;
  provider: string;
  rawBody: Uint8Array | string;
  signature: string;
  timestamp?: number;
}>;
