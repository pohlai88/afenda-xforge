export type AiSpanAttributes = {
  feature: string;
  model: string;
  moduleId?: string;
  organizationId: string;
  requestId?: string;
  workflowSessionId?: string;
};

export function withAiSpan<T>(
  _spanName: string,
  _attributes: AiSpanAttributes,
  fn: () => Promise<T>
): Promise<T> {
  return fn();
}
