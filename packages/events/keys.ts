import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export type EventsKeys = {
  readonly NATS_CLIENT_NAME_PREFIX: string;
  readonly NATS_DEFAULT_STREAM_MAX_AGE_MS: number;
  readonly NATS_DEFAULT_STREAM_MAX_BYTES: number;
  readonly NATS_PING_INTERVAL_MS: number;
  readonly NATS_RECONNECT_TIME_WAIT_MS: number;
  readonly NATS_STREAM_PREFIX: string;
  readonly NATS_URL?: string;
};

export const keys = (): EventsKeys =>
  createEnv({
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
    server: {
      NATS_URL: z.string().url().optional(),
      NATS_CLIENT_NAME_PREFIX: z.string().min(1).default("xforge"),
      NATS_STREAM_PREFIX: z.string().min(1).default("XFORGE"),
      NATS_RECONNECT_TIME_WAIT_MS: z.coerce
        .number()
        .int()
        .positive()
        .default(2000),
      NATS_PING_INTERVAL_MS: z.coerce.number().int().positive().default(30_000),
      NATS_DEFAULT_STREAM_MAX_AGE_MS: z.coerce
        .number()
        .int()
        .positive()
        .default(7 * 24 * 60 * 60 * 1000),
      NATS_DEFAULT_STREAM_MAX_BYTES: z.coerce
        .number()
        .int()
        .positive()
        .default(512 * 1024 * 1024),
    },
    runtimeEnv: {
      NATS_URL: process.env.NATS_URL,
      NATS_CLIENT_NAME_PREFIX: process.env.NATS_CLIENT_NAME_PREFIX,
      NATS_STREAM_PREFIX: process.env.NATS_STREAM_PREFIX,
      NATS_RECONNECT_TIME_WAIT_MS: process.env.NATS_RECONNECT_TIME_WAIT_MS,
      NATS_PING_INTERVAL_MS: process.env.NATS_PING_INTERVAL_MS,
      NATS_DEFAULT_STREAM_MAX_AGE_MS:
        process.env.NATS_DEFAULT_STREAM_MAX_AGE_MS,
      NATS_DEFAULT_STREAM_MAX_BYTES: process.env.NATS_DEFAULT_STREAM_MAX_BYTES,
    },
  });

let cachedEventsKeys: EventsKeys | null = null;

export const loadEventsKeys = (): EventsKeys => (cachedEventsKeys ??= keys());

export const hasEventsConfig = (): boolean =>
  Boolean(loadEventsKeys().NATS_URL);
