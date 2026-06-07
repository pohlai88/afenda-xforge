import type {
  ToolLoopAgentOnFinishCallback,
  ToolLoopAgentOnStepFinishCallback,
  ToolLoopAgentSettings,
  ToolSet,
} from "ai";
import { stepCountIs, ToolLoopAgent } from "ai";
import { getAssistantSystemPrompt } from "./ai-system.prompt.ts";

const DEFAULT_MAX_STEPS = 6;
const MIN_MAX_STEPS = 1;
const MAX_MAX_STEPS = 12;

export type CreateAiAssistantAgentInput<TTools extends ToolSet> = {
  model: ToolLoopAgentSettings<never, TTools>["model"];
  organizationName: string;
  role: string;
  tools: TTools;
  providerOptions?: ToolLoopAgentSettings<never, TTools>["providerOptions"];
  maxSteps?: number;
  onStepFinish?: ToolLoopAgentOnStepFinishCallback<TTools>;
  onFinish?: ToolLoopAgentOnFinishCallback<TTools>;
  experimental_telemetry?: ToolLoopAgentSettings<
    never,
    TTools
  >["experimental_telemetry"];
};

export function createAiAssistantAgent<TTools extends ToolSet>(
  input: CreateAiAssistantAgentInput<TTools>
): ToolLoopAgent<never, TTools> {
  const maxSteps = Math.min(
    Math.max(input.maxSteps ?? DEFAULT_MAX_STEPS, MIN_MAX_STEPS),
    MAX_MAX_STEPS
  );

  return new ToolLoopAgent({
    id: "xforge-assistant",
    model: input.model,
    instructions: getAssistantSystemPrompt({
      organizationName: input.organizationName,
      role: input.role,
    }),
    tools: input.tools,
    stopWhen: stepCountIs(maxSteps),
    providerOptions: input.providerOptions,
    onStepFinish: input.onStepFinish,
    onFinish: input.onFinish,
    experimental_telemetry: input.experimental_telemetry,
  });
}
