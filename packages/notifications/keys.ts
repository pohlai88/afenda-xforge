import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = (): {
  KNOCK_SECRET_API_KEY?: string;
  NEXT_PUBLIC_KNOCK_API_KEY?: string;
  NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID?: string;
} =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      KNOCK_SECRET_API_KEY: z.string().min(1).optional(),
    },
    client: {
      NEXT_PUBLIC_KNOCK_API_KEY: z.string().min(1).optional(),
      NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID: z.string().min(1).optional(),
    },
    runtimeEnv: {
      KNOCK_SECRET_API_KEY: process.env.KNOCK_SECRET_API_KEY,
      NEXT_PUBLIC_KNOCK_API_KEY: process.env.NEXT_PUBLIC_KNOCK_API_KEY,
      NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID:
        process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID,
    },
  });

export type NotificationsKeys = ReturnType<typeof keys>;

let cachedNotificationsKeys: NotificationsKeys | null = null;

export const loadNotificationsKeys = (): NotificationsKeys =>
  (cachedNotificationsKeys ??= keys());
