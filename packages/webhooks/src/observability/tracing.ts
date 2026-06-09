export type WebhookTraceContext = Readonly<{
  companyId?: string;
  deliveryId?: string;
  eventId: string;
  operationId: string;
  provider: string;
  requestId: string;
  tenantId: string;
}>;

export const createWebhookTraceContext = (
  context: WebhookTraceContext
): WebhookTraceContext => context;
