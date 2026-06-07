import "server-only";

import { timingSafeEqual } from "node:crypto";

import type { AppLogger } from "@repo/logger";
import {
  createPackageLogger,
  getRequestId,
  logServerEvent,
} from "@repo/logger/server";

export type DrainPayloadSummary = {
  eventCount: number;
  payloadType: "json-array" | "json-object" | "ndjson" | "unknown";
};

export type LoggingHealth = {
  configured: boolean;
  level: string;
};

export type ObservabilityDrainOptions = {
  logger?: AppLogger;
  route?: string;
  signatureHeader?: string;
  signatureSecret?: string;
};

const supportedLogLevels = [
  "debug",
  "error",
  "fatal",
  "info",
  "trace",
  "warn",
] as const;

const isSupportedLogLevel = (value: string): boolean =>
  supportedLogLevels.includes(value as (typeof supportedLogLevels)[number]);

const timingSafeStringEqual = (left: string, right: string): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(left), Buffer.from(right));
};

const bytesToHex = (bytes: ArrayBuffer): string =>
  Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

export function getLoggingHealth(
  input: NodeJS.ProcessEnv = process.env
): LoggingHealth {
  const level = input.LOG_LEVEL ?? "info";

  return {
    configured: isSupportedLogLevel(level),
    level,
  };
}

export async function verifyVercelSignature(input: {
  rawBody: string;
  signature: string | null;
  secret: string;
}): Promise<boolean> {
  if (!input.signature) {
    return false;
  }

  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(input.secret),
    {
      name: "HMAC",
      hash: "SHA-1",
    },
    false,
    ["sign"]
  );
  const digest = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(input.rawBody)
  );

  return timingSafeStringEqual(bytesToHex(digest), input.signature);
}

export function summarizeDrainPayload(rawBody: string): DrainPayloadSummary {
  const trimmedBody = rawBody.trim();

  if (!trimmedBody) {
    return {
      eventCount: 0,
      payloadType: "unknown",
    };
  }

  try {
    const parsed = JSON.parse(trimmedBody) as unknown;

    if (Array.isArray(parsed)) {
      return {
        eventCount: parsed.length,
        payloadType: "json-array",
      };
    }

    return {
      eventCount: 1,
      payloadType: "json-object",
    };
  } catch {
    const lineCount = trimmedBody
      .split("\n")
      .filter((line) => line.trim().length > 0).length;

    return {
      eventCount: lineCount,
      payloadType: "ndjson",
    };
  }
}

export async function handleObservabilityDrainPost(
  request: Request,
  options: ObservabilityDrainOptions = {}
): Promise<Response> {
  const startedAt = Date.now();
  const route = options.route ?? "/api/internal/v1/observability/drain";
  const logger = options.logger ?? createPackageLogger("observability");
  const requestId = getRequestId(request);
  const context = {
    module: "observability",
    operation: "drain.ingest",
    operationId: requestId,
    requestId,
  };
  const signatureSecret = options.signatureSecret?.trim() ?? "";
  const signatureHeader = options.signatureHeader ?? "x-vercel-signature";

  if (!signatureSecret) {
    logServerEvent(
      logger,
      "error",
      "Drain secret is not configured.",
      context,
      {
        route,
        status: 503,
      }
    );

    return Response.json(
      { error: "Drain endpoint is not configured." },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get(signatureHeader);

  if (
    !(await verifyVercelSignature({
      rawBody,
      secret: signatureSecret,
      signature,
    }))
  ) {
    logServerEvent(logger, "warn", "Drain signature rejected.", context, {
      durationMs: Date.now() - startedAt,
      route,
      status: 403,
    });

    return Response.json(
      { code: "invalid_signature", error: "Invalid drain signature." },
      { status: 403 }
    );
  }

  const payloadSummary = summarizeDrainPayload(rawBody);

  logServerEvent(logger, "info", "Drain payload accepted.", context, {
    ...payloadSummary,
    durationMs: Date.now() - startedAt,
    route,
    status: 200,
  });

  return Response.json({
    ...payloadSummary,
    success: true,
  });
}
