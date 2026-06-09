export type WebhookTenantResolutionHints = Readonly<{
  companyId?: string;
  organizationId?: string;
  tenantId?: string;
  workspaceId?: string;
}>;

export type ResolvedWebhookTenantContext = Readonly<{
  companyId?: string;
  organizationId?: string;
  tenantId: string;
  workspaceId?: string;
}>;

export type TrustedWebhookTenantLookupInput = Readonly<{
  companyId?: string;
  endpointId: string;
  organizationId?: string;
  provider: string;
  tenantId?: string;
  workspaceId?: string;
}>;

export type TrustedWebhookTenantResolver = Readonly<{
  resolveTenantId: (
    input: TrustedWebhookTenantLookupInput
  ) => Promise<string> | string;
  validateCompanyId?: (
    tenantId: string,
    companyId: string,
    input: TrustedWebhookTenantLookupInput
  ) => Promise<boolean> | boolean;
  validateOrganizationId?: (
    tenantId: string,
    organizationId: string,
    input: TrustedWebhookTenantLookupInput
  ) => Promise<boolean> | boolean;
  validateWorkspaceId?: (
    tenantId: string,
    workspaceId: string,
    input: TrustedWebhookTenantLookupInput
  ) => Promise<boolean> | boolean;
}>;

export const createResolvedWebhookTenantContext = (
  tenantId: string,
  hints: WebhookTenantResolutionHints = {}
): ResolvedWebhookTenantContext => {
  if (!tenantId) {
    throw new Error("Resolved webhook tenant context requires tenantId");
  }

  return {
    companyId: hints.companyId,
    organizationId: hints.organizationId,
    tenantId,
    workspaceId: hints.workspaceId,
  };
};

export const resolveTrustedWebhookTenantContext = async (
  input: TrustedWebhookTenantLookupInput,
  resolver: TrustedWebhookTenantResolver
): Promise<ResolvedWebhookTenantContext> => {
  const tenantId = await resolver.resolveTenantId(input);
  const resolvedContext = createResolvedWebhookTenantContext(tenantId, input);

  if (
    resolvedContext.companyId &&
    !(
      resolver.validateCompanyId &&
      (await resolver.validateCompanyId(
        tenantId,
        resolvedContext.companyId,
        input
      ))
    )
  ) {
    throw new Error("Webhook company context is not trusted");
  }

  if (resolvedContext.organizationId) {
    if (!resolver.validateOrganizationId) {
      throw new Error("Webhook organization context is not supported");
    }

    if (
      !(await resolver.validateOrganizationId(
        tenantId,
        resolvedContext.organizationId,
        input
      ))
    ) {
      throw new Error("Webhook organization context is not trusted");
    }
  }

  if (resolvedContext.workspaceId) {
    if (!resolver.validateWorkspaceId) {
      throw new Error("Webhook workspace context is not supported");
    }

    if (
      !(await resolver.validateWorkspaceId(
        tenantId,
        resolvedContext.workspaceId,
        input
      ))
    ) {
      throw new Error("Webhook workspace context is not trusted");
    }
  }

  return resolvedContext;
};
