import { z } from "zod";
import { hrConsoleCapabilities } from "./feature-scope.ts";

export const hrConsoleDomainSchema = z.enum([
  "overview",
  "delegation",
  "leave",
  "calendars",
  "policy",
  "encashment",
  "employee-access",
]);

export const hrConsoleCapabilitySchema = z.enum([
  hrConsoleCapabilities.overviewRead,
  hrConsoleCapabilities.sectionsRead,
  hrConsoleCapabilities.delegationRead,
  hrConsoleCapabilities.delegationManage,
]);

export const moduleConsoleGovernanceModeSchema = z.enum([
  "unassigned_fallback",
  "operator_assigned",
]);

export const hrConsoleScopeSchema = z.object({
  tenantId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  companyId: z.string().trim().min(1),
  tenantRole: z.string().trim().min(1),
  grantedPermissions: z.array(z.string().trim().min(1)).default([]),
  requestId: z.string().trim().min(1).optional(),
  operationId: z.string().trim().min(1).optional(),
});

export const listHrConsoleSectionsQuerySchema = z.object({
  domain: hrConsoleDomainSchema.optional(),
});

export const hrConsoleSectionSchema = z.object({
  appPath: z.string().trim().min(1),
  description: z.string().trim().min(1),
  domain: hrConsoleDomainSchema,
  id: z.string().trim().min(1),
  requiredPermission: hrConsoleCapabilitySchema,
  status: z.enum(["ready", "deferred", "blocked"]),
  title: z.string().trim().min(1),
});

export const hrConsoleOverviewSchema = z.object({
  companyId: z.string().trim().min(1),
  governanceMode: moduleConsoleGovernanceModeSchema,
  grantedCapabilities: z.array(z.string().trim().min(1)),
  sections: z.array(hrConsoleSectionSchema),
  tenantId: z.string().trim().min(1),
  warnings: z.array(z.string()),
  actingAsConsoleOperator: z.boolean().optional(),
  canDelegate: z.boolean(),
  canDomainWrite: z.boolean(),
});

export const hrDelegationGrantSchema = z.object({
  capabilities: z.array(z.string().trim().min(1)),
  companyId: z.string().trim().min(1),
  createdAt: z.string().trim().min(1),
  granteeId: z.string().trim().min(1),
  grantorId: z.string().trim().min(1),
  id: z.string().trim().min(1),
  reason: z.string().trim().min(1).optional(),
  revokedAt: z.string().trim().min(1).optional(),
  tenantId: z.string().trim().min(1),
  validFrom: z.string().trim().min(1).optional(),
  validTo: z.string().trim().min(1).optional(),
});

export const grantHrDelegationCommandSchema = z.object({
  capabilities: z.array(z.string().trim().min(1)).min(1),
  granteeId: z.string().trim().min(1),
  reason: z.string().trim().min(1).max(240),
  validFrom: z.string().trim().min(1).optional(),
  validTo: z.string().trim().min(1).optional(),
});

export const revokeHrDelegationCommandSchema = z.object({
  grantId: z.string().trim().min(1),
  reason: z.string().trim().min(1).max(240),
});

export type HrConsoleCapability = z.infer<typeof hrConsoleCapabilitySchema>;
export type HrConsoleDomain = z.infer<typeof hrConsoleDomainSchema>;
export type ModuleConsoleGovernanceMode = z.infer<
  typeof moduleConsoleGovernanceModeSchema
>;
export type HrConsoleScope = z.infer<typeof hrConsoleScopeSchema>;
export type HrConsoleSection = z.infer<typeof hrConsoleSectionSchema>;
export type HrConsoleOverview = z.infer<typeof hrConsoleOverviewSchema>;
export type ListHrConsoleSectionsQuery = z.infer<
  typeof listHrConsoleSectionsQuerySchema
>;
export type HrDelegationGrant = z.infer<typeof hrDelegationGrantSchema>;
export type GrantHrDelegationCommand = z.infer<
  typeof grantHrDelegationCommandSchema
>;
export type RevokeHrDelegationCommand = z.infer<
  typeof revokeHrDelegationCommandSchema
>;

export type ResolvedModuleConsoleAccess = Readonly<{
  actingAsConsoleOperator?: boolean;
  canDelegate: boolean;
  canDomainWrite: boolean;
  governanceMode: ModuleConsoleGovernanceMode;
  grantedCapabilities: readonly string[];
}>;

export type ModuleConsoleOperatorAssignmentSnapshot = Readonly<{
  capabilities?: readonly string[];
  companyId: string;
  consoleId: string;
  operatorUserId: string;
  revokedAt?: string;
  validFrom?: string;
  validTo?: string;
}>;

export type HrDelegationGrantSnapshot = Readonly<{
  capabilities: readonly string[];
  companyId: string;
  granteeId: string;
  grantorId: string;
  revokedAt?: string;
  validFrom?: string;
  validTo?: string;
}>;
