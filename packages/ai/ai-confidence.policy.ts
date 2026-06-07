import type { ConfidenceBreakdown } from "./ai-operations.schema.ts";
import { confidenceBreakdownSchema } from "./ai-operations.schema.ts";

export type ScoreAiConfidenceInput = {
  evidenceCount: number;
  directSourceCount: number;
  missingDataCount: number;
  userGoal?: string;
  taskRiskLevel?: "low" | "medium" | "high";
  historicalAccuracy?: number;
};

type ConfidenceLevel = "high" | "medium" | "low";

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 75) {
    return "high";
  }

  if (score >= 50) {
    return "medium";
  }

  return "low";
}

export function scoreAiConfidence(
  input: ScoreAiConfidenceInput
): ConfidenceBreakdown {
  const dataQuality = clampScore(
    45 +
      input.directSourceCount * 8 +
      input.evidenceCount * 3 -
      input.missingDataCount * 12
  );
  const goalLength = input.userGoal?.trim().length ?? 0;
  let intentClarity = 40;
  if (goalLength >= 40) {
    intentClarity = 85;
  } else if (goalLength >= 12) {
    intentClarity = 65;
  }

  let taskComplexity = 85;
  if (input.taskRiskLevel === "high") {
    taskComplexity = 52;
  } else if (input.taskRiskLevel === "medium") {
    taskComplexity = 70;
  }
  const historicalAccuracy = clampScore(input.historicalAccuracy ?? 70);
  const groundingStrength = clampScore(
    input.evidenceCount === 0
      ? 25
      : 45 + input.directSourceCount * 10 - input.missingDataCount * 10
  );
  const overall = clampScore(
    dataQuality * 0.28 +
      intentClarity * 0.18 +
      taskComplexity * 0.16 +
      historicalAccuracy * 0.16 +
      groundingStrength * 0.22
  );
  const level = getConfidenceLevel(overall);
  const weakSignals = [
    dataQuality < 55 ? "data quality is limited" : null,
    groundingStrength < 55 ? "source grounding is limited" : null,
    input.missingDataCount > 0 ? "missing data should be reviewed" : null,
  ].filter((item): item is string => Boolean(item));

  return confidenceBreakdownSchema.parse({
    overall,
    level,
    dataQuality,
    intentClarity,
    taskComplexity,
    historicalAccuracy,
    groundingStrength,
    requiresHumanReview: input.taskRiskLevel === "high" || overall < 75,
    explanation:
      weakSignals.length > 0
        ? `${level} confidence because ${weakSignals.join(", ")}.`
        : `${level} confidence from direct evidence and clear intent.`,
  });
}
