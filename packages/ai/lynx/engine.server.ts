import "server-only";

import { createOpenAI } from "@ai-sdk/openai";
import { generateText, streamText, tool } from "ai";
import { loadAiKeys } from "../keys.ts";
import {
  defaultXforgeAssistants,
  generalAssistant,
} from "./assistants.server.ts";
import { buildXforgeSystemPrompt } from "./context.server.ts";
import type {
  XforgeAssistantDefinition,
  XforgeAssistantTool,
  XforgeConversationContext,
  XforgeLynxConfig,
  XforgeLynxRequest,
} from "./types.ts";
import { classifyXforgeIntent } from "./utils.ts";

export type XforgeLynxChatResult = Awaited<ReturnType<typeof generateText>>;
export type XforgeLynxStreamResult = ReturnType<typeof streamText>;

export type XforgeAssistantRegistry = Readonly<{
  list: () => readonly XforgeAssistantDefinition[];
  resolve: (
    module: XforgeConversationContext["module"]
  ) => XforgeAssistantDefinition;
}>;

export type XforgeLynx = Readonly<{
  chat: (request: XforgeLynxRequest) => Promise<XforgeLynxChatResult>;
  stream: (request: XforgeLynxRequest) => Promise<XforgeLynxStreamResult>;
}>;

export type XforgeCopilotChatResult = XforgeLynxChatResult;
export type XforgeCopilotStreamResult = XforgeLynxStreamResult;
export type XforgeCopilot = XforgeLynx;

const resolveChatModel = (
  config: XforgeLynxConfig
): ReturnType<ReturnType<typeof createOpenAI>> => {
  const envKeys = loadAiKeys();
  const apiKey = config.apiKey ?? envKeys.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required to use @repo/ai lynx helpers");
  }

  const openai = createOpenAI({ apiKey });
  return openai(config.model ?? envKeys.AI_MODEL_CHAT);
};

const buildAssistantRegistry = (
  assistants: readonly XforgeAssistantDefinition[]
): XforgeAssistantRegistry => {
  const assistantMap = new Map(
    assistants.map((assistant) => [assistant.module, assistant] as const)
  );

  return {
    list: () => assistants,
    resolve: (module: XforgeConversationContext["module"]) =>
      assistantMap.get(module ?? "general") ??
      assistantMap.get("general") ??
      assistants[0] ??
      generalAssistant,
  };
};

const toToolSet = (
  tools: readonly XforgeAssistantTool[] | undefined,
  context: XforgeConversationContext
): Record<string, unknown> | undefined => {
  if (!tools || tools.length === 0) {
    return;
  }

  return Object.fromEntries(
    tools.map((definition) => [
      definition.name,
      tool({
        description: definition.description,
        inputSchema: definition.inputSchema,
        execute: async (input: unknown) => {
          const result = await definition.execute(input as never, context);

          return typeof result === "string"
            ? result
            : JSON.stringify(result, null, 2);
        },
      }),
    ])
  ) as Record<string, unknown>;
};

const buildMessages = (
  context: XforgeConversationContext,
  message: string
): Array<{ content: string; role: "assistant" | "system" | "user" }> => [
  ...(context.history ?? []),
  { content: message, role: "user" },
];

export const createXforgeLynx = (config: XforgeLynxConfig = {}): XforgeLynx => {
  const enabledModules = config.enabledModules;
  const assistants = buildAssistantRegistry(
    (config.assistants ?? defaultXforgeAssistants).filter((assistant) =>
      enabledModules ? enabledModules.includes(assistant.module) : true
    )
  );
  const model = resolveChatModel(config);

  return {
    chat: async ({ context, message }: XforgeLynxRequest) => {
      const intent = classifyXforgeIntent(message);
      const assistant = assistants.resolve(context.module ?? intent.module);
      const system = await buildXforgeSystemPrompt(
        assistant,
        {
          ...context,
          language: context.language ?? config.language ?? "en",
          module: context.module ?? intent.module,
        },
        { maxContextTokens: config.maxContextTokens ?? 1500 }
      );

      return (await generateText({
        messages: buildMessages(
          {
            ...context,
            language: context.language ?? config.language ?? "en",
            module: context.module ?? intent.module,
          },
          message
        ),
        maxOutputTokens: config.maxOutputTokens ?? 2048,
        model,
        system,
        temperature: config.temperature ?? 0.3,
        tools: toToolSet(assistant.tools, {
          ...context,
          language: context.language ?? config.language ?? "en",
          module: context.module ?? intent.module,
        }) as never,
      })) as unknown as XforgeLynxChatResult;
    },
    stream: async ({ context, message }: XforgeLynxRequest) => {
      const intent = classifyXforgeIntent(message);
      const assistant = assistants.resolve(context.module ?? intent.module);
      const resolvedContext: XforgeConversationContext = {
        ...context,
        language: context.language ?? config.language ?? "en",
        module: context.module ?? intent.module,
      };
      const system = await buildXforgeSystemPrompt(assistant, resolvedContext, {
        maxContextTokens: config.maxContextTokens ?? 1500,
      });

      return streamText({
        messages: buildMessages(resolvedContext, message),
        maxOutputTokens: config.maxOutputTokens ?? 2048,
        model,
        system,
        temperature: config.temperature ?? 0.3,
        tools: toToolSet(assistant.tools, resolvedContext) as never,
      }) as unknown as XforgeLynxStreamResult;
    },
  };
};

export {
  buildAssistantRegistry as createXforgeAssistantRegistry,
  createXforgeLynx as createXforgeCopilot,
};
