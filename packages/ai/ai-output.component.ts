/**
 * Headless component output contracts for @repo/ai.
 *
 * These types define the serializable shapes that AI-generated responses
 * produce for governed renderers and workspace surface components to consume.
 * No React, no JSX — these are pure data contracts.
 *
 * UI components in the app layer must accept these shapes and own all rendering logic.
 */

import type { GatewaySpendReport } from "./ai-context.contract.ts";
import type {
  AiContextAssembly,
  ConfidenceBreakdown,
  GroundedEvidence,
} from "./ai-operations.schema.ts";
import type {
  AnomalyExplanation,
  ApprovalRecommendation,
  ReportNarrative,
  WorkspaceSummary,
} from "./ai-recommendations.schema.ts";

// ---------------------------------------------------------------------------
// Spend report component contract
// ---------------------------------------------------------------------------

export type AiSpendReportComponentData = GatewaySpendReport & {
  organizationId: string;
  generatedAt: string;
};

// ---------------------------------------------------------------------------
// Context panel component contract
// ---------------------------------------------------------------------------

export type AiContextPanelComponentData = {
  assembly: AiContextAssembly;
  confidence: ConfidenceBreakdown;
  evidence: readonly GroundedEvidence[];
};

// ---------------------------------------------------------------------------
// Workspace summary component contract
// ---------------------------------------------------------------------------

export type AiWorkspaceSummaryComponentData = WorkspaceSummary & {
  organizationId: string;
  generatedAt: string;
};

// ---------------------------------------------------------------------------
// Approval recommendation component contract
// ---------------------------------------------------------------------------

export type AiApprovalRecommendationComponentData = ApprovalRecommendation & {
  workItemId: string;
  organizationId: string;
};

// ---------------------------------------------------------------------------
// Anomaly explanation component contract
// ---------------------------------------------------------------------------

export type AiAnomalyExplanationComponentData = AnomalyExplanation & {
  organizationId: string;
  generatedAt: string;
};

// ---------------------------------------------------------------------------
// Report narrative component contract
// ---------------------------------------------------------------------------

export type AiReportNarrativeComponentData = ReportNarrative & {
  organizationId: string;
  generatedAt: string;
};
