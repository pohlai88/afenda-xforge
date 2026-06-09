export type PermissionKey = string;

export type PermissionScope = {
  companyId?: string;
  record?: Record<string, unknown>;
  resource?: string;
  tenantId?: string;
};

export type PermissionRecordRule = {
  name: string;
  assess: (context: PermissionContext) => boolean;
};

export type PermissionRequirement = {
  anyOf?: PermissionKey[];
  allOf?: PermissionKey[];
  recordRules?: PermissionRecordRule[];
};

export type PermissionDecision = {
  allow: boolean;
  reason?: string;
  required?: PermissionRequirement;
  missing?: PermissionKey[];
  failedRecordRule?: string;
  scope?: PermissionScope;
};

export type PermissionContext = {
  actorId: string;
  tenantId?: string;
  companyId?: string;
  action: string;
  resource?: string;
  record?: Record<string, unknown>;
  grantedPermissions: Iterable<PermissionKey>;
  metadata?: Record<string, unknown>;
};
