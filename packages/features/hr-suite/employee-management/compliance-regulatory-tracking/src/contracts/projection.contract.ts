import type { z } from "zod";
import {
  complianceAlertSchema,
  complianceAuditEventSchema,
  complianceCalendarItemSchema,
  complianceOverviewSchema,
  complianceRequirementSchema,
} from "../schema.ts";

export const complianceOverviewProjectionSchema: typeof complianceOverviewSchema =
  complianceOverviewSchema;

export const complianceRequirementProjectionSchema: typeof complianceRequirementSchema =
  complianceRequirementSchema;

export const complianceAlertProjectionSchema: typeof complianceAlertSchema =
  complianceAlertSchema;

export const complianceRegulatoryCalendarProjectionSchema: typeof complianceCalendarItemSchema =
  complianceCalendarItemSchema;

export const complianceAuditEventProjectionSchema: typeof complianceAuditEventSchema =
  complianceAuditEventSchema;

export type ComplianceRequirementProjection = z.infer<
  typeof complianceRequirementProjectionSchema
>;

export type ComplianceOverviewProjection = z.infer<
  typeof complianceOverviewProjectionSchema
>;

export type ComplianceAlertProjection = z.infer<
  typeof complianceAlertProjectionSchema
>;

export type ComplianceRegulatoryCalendarProjection = z.infer<
  typeof complianceRegulatoryCalendarProjectionSchema
>;

export type ComplianceAuditEventProjection = z.infer<
  typeof complianceAuditEventProjectionSchema
>;
