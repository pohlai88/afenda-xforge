import { z } from "zod";
import {
  complianceFilingRecordSchema,
  complianceReportExportSchema,
} from "../schema.ts";
import {
  complianceAlertProjectionSchema,
  complianceAuditEventProjectionSchema,
  complianceOverviewProjectionSchema,
  complianceRegulatoryCalendarProjectionSchema,
  complianceRequirementProjectionSchema,
} from "./projection.contract.ts";

export const COMPLIANCE_REGULATORY_TRACKING_CONTRACT_VERSION = 1 as const;

export const complianceRegulatoryTrackingRoutePaths = {
  hub: "/hr",
  compliance: "/hr/compliance",
  detail: (complianceId: string): `/hr/compliance/${string}` =>
    `/hr/compliance/${complianceId}`,
} as const;

export type ComplianceRegulatoryTrackingRoutePath =
  | (typeof complianceRegulatoryTrackingRoutePaths)["hub"]
  | (typeof complianceRegulatoryTrackingRoutePaths)["compliance"]
  | ReturnType<typeof complianceRegulatoryTrackingRoutePaths.detail>;

export const hrComplianceRoutePaths = {
  hub: complianceRegulatoryTrackingRoutePaths.hub,
  compliance: complianceRegulatoryTrackingRoutePaths.compliance,
} as const;

export type HrComplianceRoutePath =
  (typeof hrComplianceRoutePaths)[keyof typeof hrComplianceRoutePaths];

export const complianceRegulatoryTrackingRouteContracts = {
  overview: complianceOverviewProjectionSchema,
  requirements: z.array(complianceRequirementProjectionSchema),
  alerts: z.array(complianceAlertProjectionSchema),
  regulatoryCalendar: z.array(complianceRegulatoryCalendarProjectionSchema),
  auditTrail: z.array(complianceAuditEventProjectionSchema),
  filings: z.array(complianceFilingRecordSchema),
  reportExport: complianceReportExportSchema,
} as const;

export const complianceRegulatoryTrackingManifestRouteContracts = {
  overview: {
    method: "GET",
    path: "/api/hr/compliance/overview",
    version: "2026-06-01",
  },
  requirements: {
    method: "GET",
    path: "/api/hr/compliance/requirements",
    version: "2026-06-01",
  },
  alerts: {
    method: "GET",
    path: "/api/hr/compliance/alerts",
    version: "2026-06-01",
  },
  regulatoryCalendar: {
    method: "GET",
    path: "/api/hr/compliance/regulatory-calendar",
    version: "2026-06-01",
  },
  auditTrail: {
    method: "GET",
    path: "/api/hr/compliance/audit-trail",
    version: "2026-06-01",
  },
  filings: {
    method: "GET",
    path: "/api/hr/compliance/filings",
    version: "2026-06-01",
  },
  reportExport: {
    method: "POST",
    path: "/api/hr/compliance/reports/export",
    version: "2026-06-01",
  },
} as const;
