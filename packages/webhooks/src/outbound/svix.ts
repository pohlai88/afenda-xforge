import "server-only";

import { Svix } from "svix";

import type {
  SvixAppPortalAccessResult,
  SvixMessageCreateResult,
  WebhookPayload,
  WebhooksClient,
} from "../contract.ts";
import { loadWebhooksKeys } from "../keys.ts";

const getSvixClient = (): Svix | null => {
  const { SVIX_TOKEN } = loadWebhooksKeys();

  if (!SVIX_TOKEN) {
    return null;
  }

  return new Svix(SVIX_TOKEN);
};

export const sendWebhook = (
  applicationId: string,
  eventType: string,
  payload: WebhookPayload,
  applicationName = applicationId
): Promise<SvixMessageCreateResult> => {
  const svix = getSvixClient();

  if (!svix) {
    throw new Error("SVIX_TOKEN is not set");
  }

  return svix.message.create(applicationId, {
    application: {
      name: applicationName,
      uid: applicationId,
    },
    eventType,
    payload: {
      eventType,
      ...payload,
    },
  });
};

export const getWebhookAppPortal = (
  applicationId: string,
  applicationName = applicationId
): Promise<SvixAppPortalAccessResult> => {
  const svix = getSvixClient();

  if (!svix) {
    throw new Error("SVIX_TOKEN is not set");
  }

  return svix.authentication.appPortalAccess(applicationId, {
    application: {
      name: applicationName,
      uid: applicationId,
    },
  });
};

export const webhooks: WebhooksClient = {
  getWebhookAppPortal,
  sendWebhook,
};
