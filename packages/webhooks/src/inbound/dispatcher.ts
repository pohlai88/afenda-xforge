import type { InboundWebhookEnvelope } from "./envelope.ts";

export type InboundWebhookHandler<TResult> = (
  envelope: InboundWebhookEnvelope
) => TResult;

export type InboundWebhookHandlerMap<TResult> = Readonly<
  Record<string, InboundWebhookHandler<TResult>>
>;

export const dispatchInboundWebhook = <TResult>(
  handlers: InboundWebhookHandlerMap<TResult>,
  envelope: InboundWebhookEnvelope
): TResult => {
  const handler = handlers[envelope.eventType];

  if (!handler) {
    throw new Error(
      `No inbound webhook handler for event type: ${envelope.eventType}`
    );
  }

  return handler(envelope);
};
