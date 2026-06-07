import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export type AiKeys = Readonly<{
  AI_MODEL_CHAT: string;
  AI_MODEL_EMBEDDINGS: string;
  OPENAI_API_KEY?: string;
}>;

export const keys = (): AiKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      OPENAI_API_KEY: z.string().min(1).optional(),
      AI_MODEL_CHAT: z.string().min(1).default("gpt-4o-mini"),
      AI_MODEL_EMBEDDINGS: z.string().min(1).default("text-embedding-3-small"),
    },
    runtimeEnv: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      AI_MODEL_CHAT: process.env.AI_MODEL_CHAT,
      AI_MODEL_EMBEDDINGS: process.env.AI_MODEL_EMBEDDINGS,
    },
  });

let cachedAiKeys: AiKeys | null = null;

export const loadAiKeys = (): AiKeys => (cachedAiKeys ??= keys());
