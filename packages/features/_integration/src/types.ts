export type IntegrationStep<TContext> = Readonly<{
  key: string;
  description?: string;
  run: (context: TContext) => Promise<void> | void;
}>;

export type IntegrationFlow<TContext> = Readonly<{
  name: string;
  steps: readonly IntegrationStep<TContext>[];
}>;

export type IntegrationFlowResult = Readonly<{
  name: string;
  startedAt: Date;
  finishedAt: Date;
  durationMs: number;
  completedSteps: readonly string[];
}>;
