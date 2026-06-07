export type PermissionKey = string;

export type PermissionRequirement = {
  anyOf?: PermissionKey[];
  allOf?: PermissionKey[];
};

export type PermissionDecision = {
  allow: boolean;
  reason?: string;
  required?: PermissionRequirement;
  missing?: PermissionKey[];
};

export type PermissionContext = {
  actorId: string;
  tenantId?: string;
  companyId?: string;
  action: string;
  resource?: string;
  grantedPermissions: Iterable<PermissionKey>;
  metadata?: Record<string, unknown>;
};
