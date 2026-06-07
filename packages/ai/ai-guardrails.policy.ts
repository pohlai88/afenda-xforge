import type { AiGatewayFeature } from "./ai-gateway.repository.server.ts";

export const aiTokenBudgets: Record<AiGatewayFeature, number> = {
  assistant: 8000,
  "document-extraction": 12_000,
  "approval-tool": 6000,
  "workspace-summary": 8000,
  "record-search": 4000,
  "document-lookup": 4000,
  "task-drafting": 4000,
  "report-narrative": 10_000,
  "anomaly-explanation": 8000,
  "admin-audit-summary": 8000,
  "solution-provider": 14_000,
  "lynx-truth": 10_000,
  "lynx-operator": 16_000,
  "knowledge-retrieval": 4000,
  "knowledge-ingest": 12_000,
} as const satisfies Record<AiGatewayFeature, number>;

export class AiBudgetError extends Error {
  readonly feature: AiGatewayFeature;
  readonly estimatedTokens: number;
  readonly maxTokens: number;
  readonly code = "AI_BUDGET_EXCEEDED";

  constructor(
    feature: AiGatewayFeature,
    estimatedTokens: number,
    maxTokens: number
  ) {
    super(
      `AI prompt budget exceeded for ${feature}: ${estimatedTokens} > ${maxTokens}.`
    );
    this.name = "AiBudgetError";
    this.feature = feature;
    this.estimatedTokens = estimatedTokens;
    this.maxTokens = maxTokens;
  }
}

export class AiPermissionError extends Error {
  readonly capability: string;
  readonly code = "AI_PERMISSION_DENIED";

  constructor(capability: string) {
    super(`AI tool requires capability: ${capability}.`);
    this.name = "AiPermissionError";
    this.capability = capability;
  }
}

export class AiSensitiveContentError extends Error {
  readonly code = "AI_SENSITIVE_CREDENTIAL_CONTENT";

  constructor() {
    super("AI input appears to contain credential-like sensitive content.");
    this.name = "AiSensitiveContentError";
  }
}

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

export function assertAiBudget(input: {
  estimatedTokens: number;
  feature: AiGatewayFeature;
  maxTokens?: number;
}): void {
  const maxTokens = input.maxTokens ?? aiTokenBudgets[input.feature];

  if (input.estimatedTokens > maxTokens) {
    throw new AiBudgetError(input.feature, input.estimatedTokens, maxTokens);
  }
}

export function isAiBudgetError(error: unknown): error is AiBudgetError {
  return error instanceof AiBudgetError;
}

export function isAiPermissionError(
  error: unknown
): error is AiPermissionError {
  return error instanceof AiPermissionError;
}

export function isAiSensitiveContentError(
  error: unknown
): error is AiSensitiveContentError {
  return error instanceof AiSensitiveContentError;
}

export function assertCapabilityAllowed(input: {
  capability: string;
  capabilities: readonly string[];
}): void {
  if (!input.capabilities.includes(input.capability)) {
    throw new AiPermissionError(input.capability);
  }
}

export function hasSensitiveCredentialPattern(text: string): boolean {
  return /\b(password|secret|api[_-]?key|private[_-]?key|token)\b/i.test(text);
}

export function assertNoSensitiveCredentialContent(text: string): void {
  if (hasSensitiveCredentialPattern(text)) {
    throw new AiSensitiveContentError();
  }
}
