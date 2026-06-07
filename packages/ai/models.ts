import "server-only";
import { createOpenAI } from "@ai-sdk/openai";
import { loadAiKeys } from "./keys.ts";

export type AiModels = {
  chat: ReturnType<ReturnType<typeof createOpenAI>>;
  embeddings: ReturnType<ReturnType<typeof createOpenAI>>;
};

let cachedModels: AiModels | undefined;

const getOpenAIModelFactory = ():
  | ReturnType<typeof createOpenAI>
  | undefined => {
  const { OPENAI_API_KEY } = loadAiKeys();

  if (!OPENAI_API_KEY) {
    return;
  }

  return createOpenAI({
    apiKey: OPENAI_API_KEY,
  });
};

export const createAiModels = (): AiModels | undefined => {
  if (cachedModels) {
    return cachedModels;
  }

  const openai = getOpenAIModelFactory();

  if (!openai) {
    return;
  }

  const env = loadAiKeys();
  cachedModels = {
    chat: openai(env.AI_MODEL_CHAT),
    embeddings: openai(env.AI_MODEL_EMBEDDINGS),
  };

  return cachedModels;
};

export const getRequiredAiModels = (): AiModels => {
  const models = createAiModels();

  if (!models) {
    throw new Error("OPENAI_API_KEY is required to use @repo/ai model helpers");
  }

  return models;
};
