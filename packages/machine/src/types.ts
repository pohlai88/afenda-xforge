import type { ZodTypeAny, output as zodOutput } from "zod";

export const xforgeAiModules = ["general", "customers", "companies"] as const;

export type XforgeAiModule = (typeof xforgeAiModules)[number];

export type XforgeLanguage = "en" | "vi";

export type XforgeChatRole = "system" | "user" | "assistant";

export type XforgeChatMessage = Readonly<{
  content: string;
  role: XforgeChatRole;
}>;

export type XforgeConversationContext = Readonly<{
  companyId?: string;
  grantedPermissions?: readonly string[];
  history?: readonly XforgeChatMessage[];
  language?: XforgeLanguage;
  metadata?: Record<string, unknown>;
  module?: XforgeAiModule;
  tenantId: string;
  userId: string;
}>;

export type XforgeContextCard = Readonly<{
  data: unknown;
  source: string;
  title: string;
  type: "metric" | "table" | "note";
}>;

export type XforgeContextBundle = Readonly<{
  contextString: string;
  dataCards: readonly XforgeContextCard[];
  tokenEstimate: number;
  warnings: readonly string[];
}>;

export type XforgeIntent = Readonly<{
  action: string;
  confidence: number;
  module: XforgeAiModule;
}>;

export type XforgeAssistantTool<TInputSchema extends ZodTypeAny = ZodTypeAny> =
  Readonly<{
    description: string;
    execute(
      input: zodOutput<TInputSchema>,
      context: XforgeConversationContext
    ): Promise<unknown> | unknown;
    inputSchema: TInputSchema;
    name: string;
  }>;

export type XforgeAssistantDefinition = Readonly<{
  contextBuilder: (
    context: XforgeConversationContext,
    options?: { maxContextTokens?: number }
  ) => Promise<XforgeContextBundle>;
  description: string;
  module: XforgeAiModule;
  name: string;
  systemPrompt: string;
  tools?: readonly XforgeAssistantTool[];
}>;

export type XforgeLynxConfig = Readonly<{
  apiKey?: string;
  assistants?: readonly XforgeAssistantDefinition[];
  enabledModules?: readonly XforgeAiModule[];
  language?: XforgeLanguage;
  maxContextTokens?: number;
  maxOutputTokens?: number;
  model?: string;
  temperature?: number;
}>;

export type XforgeLynxRequest = Readonly<{
  context: XforgeConversationContext;
  message: string;
}>;

export type XforgeMachineConfig = XforgeLynxConfig;
export type XforgeMachineRequest = XforgeLynxRequest;

export type XforgeCopilotConfig = XforgeLynxConfig;
export type XforgeCopilotRequest = XforgeLynxRequest;
