import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export type SecurityCSRFTokenOptions = {
  maxAgeMs?: number;
  now?: number;
  secret: string;
  sessionId: string;
  userId?: string;
};

export type SecurityCSRFValidationOptions = SecurityCSRFTokenOptions & {
  token: string;
};

export type SecurityCSRFDecision = {
  allow: boolean;
  reason?: string;
  token?: string;
};

export type SecurityCSRFRequestInput = {
  maxAgeMs?: number;
  method: string;
  now?: number;
  secret: string;
  sessionId: string;
  token?: string | null;
  userId?: string;
};

type SignedCSRFPayload = {
  nonce: string;
  sessionId: string;
  userId?: string;
  issuedAt: number;
};

const toBase64Url = (value: string | Buffer): string =>
  Buffer.from(value).toString("base64url");

const fromBase64Url = (value: string): string =>
  Buffer.from(value, "base64url").toString("utf8");

const signPayload = (payload: string, secret: string): string =>
  createHmac("sha256", secret).update(payload).digest("base64url");

const safeEqual = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

const parseSignedPayload = (payload: string): SignedCSRFPayload | null => {
  try {
    const parsed = JSON.parse(
      fromBase64Url(payload)
    ) as Partial<SignedCSRFPayload>;

    if (
      typeof parsed.nonce !== "string" ||
      typeof parsed.sessionId !== "string" ||
      typeof parsed.issuedAt !== "number"
    ) {
      return null;
    }

    return {
      nonce: parsed.nonce,
      sessionId: parsed.sessionId,
      issuedAt: parsed.issuedAt,
      ...(typeof parsed.userId === "string" ? { userId: parsed.userId } : {}),
    };
  } catch {
    return null;
  }
};

export const createSignedCSRFToken = ({
  now = Date.now(),
  secret,
  sessionId,
  userId,
}: SecurityCSRFTokenOptions): string => {
  const payload = toBase64Url(
    JSON.stringify({
      nonce: randomBytes(16).toString("base64url"),
      sessionId,
      ...(userId ? { userId } : {}),
      issuedAt: now,
    } satisfies SignedCSRFPayload)
  );

  return `${payload}.${signPayload(payload, secret)}`;
};

export const validateSignedCSRFToken = ({
  maxAgeMs = TOKEN_EXPIRY_MS,
  now = Date.now(),
  secret,
  sessionId,
  token,
  userId,
}: SecurityCSRFValidationOptions): boolean => {
  const [payload, signature, extra] = token.split(".");

  if (!(payload && signature) || extra !== undefined) {
    return false;
  }

  if (!safeEqual(signPayload(payload, secret), signature)) {
    return false;
  }

  const parsed = parseSignedPayload(payload);

  if (!parsed) {
    return false;
  }

  if (parsed.sessionId !== sessionId || parsed.userId !== userId) {
    return false;
  }

  return now - parsed.issuedAt <= maxAgeMs;
};

export const createCSRFDecision = (
  input: SecurityCSRFRequestInput
): SecurityCSRFDecision => {
  if (!UNSAFE_METHODS.has(input.method.toUpperCase())) {
    return { allow: true, reason: "safe-method" };
  }

  if (!input.token) {
    return { allow: false, reason: "missing-token" };
  }

  if (!validateSignedCSRFToken({ ...input, token: input.token })) {
    return { allow: false, reason: "invalid-token" };
  }

  return {
    allow: true,
    reason: "valid-token",
    token: createSignedCSRFToken(input),
  };
};
