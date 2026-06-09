import type { Svix } from "svix";

export type WebhookPayload = Record<string, unknown>;

export type SvixMessageCreateResult = Awaited<
  ReturnType<Svix["message"]["create"]>
>;

export type SvixAppPortalAccessResult = Awaited<
  ReturnType<Svix["authentication"]["appPortalAccess"]>
>;

export type WebhooksKeys = Readonly<{
  SVIX_TOKEN?: string;
}>;

export type WebhooksClient = Readonly<{
  getWebhookAppPortal: (
    applicationId: string,
    applicationName?: string
  ) => Promise<SvixAppPortalAccessResult>;
  sendWebhook: (
    applicationId: string,
    eventType: string,
    payload: WebhookPayload,
    applicationName?: string
  ) => Promise<SvixMessageCreateResult>;
}>;
