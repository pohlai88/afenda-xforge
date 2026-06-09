import "server-only";

export const authorizeWebhookDispatchCron = (
  authorizationHeader: string | null,
  dispatchSecretHeader: string | null
): void => {
  const configuredSecret = process.env.CRON_SECRET;

  if (!configuredSecret) {
    throw new Error("CRON_SECRET is not configured");
  }

  const bearerToken = authorizationHeader?.startsWith("Bearer ")
    ? authorizationHeader.slice("Bearer ".length)
    : null;

  if (
    bearerToken !== configuredSecret &&
    dispatchSecretHeader !== configuredSecret
  ) {
    throw new Error("Webhook dispatch cron authorization failed");
  }
};
