export type WebhookProviderCapability =
  | "app-portal"
  | "delivery"
  | "inbound"
  | "retries"
  | "signatures";

export type RegisteredWebhookProvider = Readonly<{
  provider: string;
  capabilities: readonly WebhookProviderCapability[];
  envKeys: readonly string[];
}>;

export type WebhookProviderRegistry = ReadonlyMap<
  string,
  RegisteredWebhookProvider
>;

export const createProviderRegistry = (
  providers: readonly RegisteredWebhookProvider[]
): WebhookProviderRegistry => {
  const registry = new Map<string, RegisteredWebhookProvider>();

  for (const provider of providers) {
    if (registry.has(provider.provider)) {
      throw new Error(`Duplicate webhook provider: ${provider.provider}`);
    }

    registry.set(provider.provider, provider);
  }

  return registry;
};

export const getRegisteredProvider = (
  registry: WebhookProviderRegistry,
  provider: string
): RegisteredWebhookProvider | null => registry.get(provider) ?? null;

export const assertRegisteredProvider = (
  registry: WebhookProviderRegistry,
  provider: string
): RegisteredWebhookProvider => {
  const registeredProvider = getRegisteredProvider(registry, provider);

  if (!registeredProvider) {
    throw new Error(`Unknown webhook provider: ${provider}`);
  }

  return registeredProvider;
};
