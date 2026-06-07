import { createLogger } from "@repo/logger";
import { logServerEvent } from "@repo/logger/server";
import type {
  TelemetrySettings,
  ToolLoopAgentOnStepFinishCallback,
  ToolSet,
} from "ai";
import { getUsageMetrics } from "./ai-gateway.repository.server.ts";

const logger = createLogger("ai");

type AgentStep<TTools extends ToolSet> = Parameters<
  ToolLoopAgentOnStepFinishCallback<TTools>
>[0];

type AgentObservabilityInput = {
  feature: string;
  functionId: string;
  model: string;
  moduleId: string;
  operation: string;
  organizationId: string;
  operationId?: string;
  requestId?: string;
  route: string;
  userAuthId: string;
  workflowId?: string;
  workflowSessionId?: string;
};

function optionalTelemetryMetadata(
  input: AgentObservabilityInput
): Record<string, string> {
  return {
    organizationId: input.organizationId,
    userAuthId: input.userAuthId,
    route: input.route,
    requestId: input.requestId ?? "",
    operationId: input.operationId ?? input.requestId ?? "",
    moduleId: input.moduleId,
    feature: input.feature,
    workflowId: input.workflowId ?? "",
    workflowSessionId: input.workflowSessionId ?? "",
  };
}

export function createRouteAiTelemetrySettings(
  input: AgentObservabilityInput
): TelemetrySettings {
  return {
    isEnabled: true,
    functionId: input.functionId,
    recordInputs: false,
    recordOutputs: false,
    metadata: optionalTelemetryMetadata(input),
  };
}

export function createRouteAgentStepLogger<TTools extends ToolSet>(
  input: AgentObservabilityInput
): ToolLoopAgentOnStepFinishCallback<TTools> {
  return (step: AgentStep<TTools>) => {
    const usageMetrics = getUsageMetrics(step.usage);

    logServerEvent(
      logger,
      "info",
      "AI agent step completed.",
      {
        actorId: input.userAuthId,
        organizationId: input.organizationId,
        module: input.moduleId,
        requestId: input.requestId ?? "",
        operationId: input.operationId ?? input.requestId ?? "",
        operation: input.operation,
      },
      {
        route: input.route,
        feature: input.feature,
        model: input.model,
        stepNumber: step.stepNumber,
        finishReason: step.finishReason,
        toolCallCount: step.toolCalls.length,
        toolResultCount: step.toolResults.length,
        ...usageMetrics,
        ...(input.workflowId ? { workflowId: input.workflowId } : {}),
        ...(input.workflowSessionId
          ? { workflowSessionId: input.workflowSessionId }
          : {}),
      }
    );
  };
}
