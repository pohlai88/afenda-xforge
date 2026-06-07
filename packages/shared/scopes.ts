export type UserActorScope = {
  userId: string;
};

export type TenantScope = {
  tenantId: string;
};

export type CompanyScope = TenantScope & {
  companyId: string;
};

export type TenantActorScope = TenantScope & UserActorScope;

export type CompanyActorScope = CompanyScope & UserActorScope;
