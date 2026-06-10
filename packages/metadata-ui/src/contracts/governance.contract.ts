export type MetadataTenantScope = {
  companyId?: string | null;
  organizationId?: string | null;
  tenantId: string;
  workspaceId?: string | null;
};

export type MetadataActorScope = {
  actorId: string;
  actorType?: "integration" | "service" | "system" | "user";
  actorRole?: string | null;
};

export type MetadataGovernanceSeverity = "critical" | "info" | "warning";

export type MetadataGovernancePolicy = {
  /** UI-only permission hint from consumer render context; not server authority. */
  auditAction?: string;
  capability?: string;
  featureFlag?: string;
  featureId?: string;
  moduleId?: string;
  ownerPackage?: string;
  permission?: string;
  fallback?: "disable" | "forbidden" | "hide" | "readonly";
  severity?: MetadataGovernanceSeverity;
  telemetryEvent?: string;
};

export type MetadataGovernanceDecision = {
  effect: "allow" | "disable" | "forbidden" | "hide" | "readonly";
  allowed: boolean;
  deniedReason?: string;
  diagnostics?: readonly string[];
  evaluatedAt: string;
  evaluatedPolicies?: readonly MetadataGovernancePolicy[];
  metadata?: Record<string, unknown>;
};
