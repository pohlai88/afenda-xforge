import "server-only";

import type {
  IntegrationFlow,
  IntegrationFlowResult,
  IntegrationStep,
} from "./types.ts";

export function createIntegrationFlow<TContext>(
  name: string,
  steps: readonly IntegrationStep<TContext>[]
): IntegrationFlow<TContext> {
  return {
    name,
    steps,
  };
}

export async function runIntegrationFlow<TContext>(
  flow: IntegrationFlow<TContext>,
  context: TContext
): Promise<IntegrationFlowResult> {
  const startedAt = new Date();
  const completedSteps: string[] = [];

  for (const step of flow.steps) {
    await step.run(context);
    completedSteps.push(step.key);
  }

  const finishedAt = new Date();

  return {
    name: flow.name,
    startedAt,
    finishedAt,
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    completedSteps,
  };
}
