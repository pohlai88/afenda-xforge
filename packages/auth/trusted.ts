const TRUSTED_TENANT_CONTEXT_BRAND = "__xforgeTrustedTenantContext";

type TrustedActorType = "system" | "user" | "integration" | "service";
type TrustedChannel =
  | "web"
  | "api"
  | "server_action"
  | "cron"
  | "webhook"
  | "migration";

export type TrustedTenantContext = Readonly<{
  actorType?: TrustedActorType;
  channel?: TrustedChannel;
  reason: string;
  tenantId: string;
  readonly __xforgeTrustedTenantContext: true;
}>;

export const createTrustedTenantContext = ({
  actorType,
  channel,
  reason,
  tenantId,
}: {
  actorType?: TrustedActorType;
  channel?: TrustedChannel;
  reason: string;
  tenantId: string;
}): TrustedTenantContext => {
  const context = {
    ...(actorType ? { actorType } : {}),
    ...(channel ? { channel } : {}),
    reason,
    tenantId,
    __xforgeTrustedTenantContext: true,
  } satisfies TrustedTenantContext;

  Object.defineProperty(context, TRUSTED_TENANT_CONTEXT_BRAND, {
    enumerable: false,
  });

  return Object.freeze(context);
};

export const isTrustedTenantContext = (
  value: unknown
): value is TrustedTenantContext => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const descriptor = Object.getOwnPropertyDescriptor(
    value,
    TRUSTED_TENANT_CONTEXT_BRAND
  );

  return descriptor?.value === true && descriptor.enumerable === false;
};
