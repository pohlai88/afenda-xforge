import { randomBytes, timingSafeEqual } from "node:crypto";

export type SecurityCSRFTokenOptions = {
  tokenLength?: number;
  rotateToken?: boolean;
  maxAge?: number;
};

export type SecurityCSRFDecision = {
  allow: boolean;
  reason?: string;
  token?: string;
};

type SecurityCSRFState = {
  token: string;
  createdAt: number;
  lastRotated: number;
};

const TOKEN_STORE = new Map<string, SecurityCSRFState>();
const CLEANUP_INTERVAL = 60 * 60 * 1000;
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000;
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let cleanupStarted = false;

const initializeCleanup = (): void => {
  if (cleanupStarted) {
    return;
  }

  cleanupStarted = true;

  const timer = setInterval(() => {
    const now = Date.now();

    for (const [sessionId, state] of TOKEN_STORE.entries()) {
      if (now - state.createdAt > TOKEN_EXPIRY) {
        TOKEN_STORE.delete(sessionId);
      }
    }
  }, CLEANUP_INTERVAL);

  if (typeof timer.unref === "function") {
    timer.unref();
  }
};

export const generateCSRFToken = (sessionId: string): string => {
  initializeCleanup();

  const token = randomBytes(32).toString("hex");
  const now = Date.now();

  TOKEN_STORE.set(sessionId, {
    token,
    createdAt: now,
    lastRotated: now,
  });

  return token;
};

export const validateCSRFToken = (
  sessionId: string,
  token: string
): boolean => {
  const state = TOKEN_STORE.get(sessionId);

  if (!state) {
    return false;
  }

  const now = Date.now();

  if (now - state.createdAt > TOKEN_EXPIRY) {
    TOKEN_STORE.delete(sessionId);
    return false;
  }

  if (state.token.length !== token.length) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(state.token, "utf8"),
    Buffer.from(token, "utf8")
  );
};

export const rotateCSRFToken = (sessionId: string): string => {
  const state = TOKEN_STORE.get(sessionId);

  if (state && Date.now() - state.createdAt > TOKEN_EXPIRY) {
    TOKEN_STORE.delete(sessionId);
  }

  return generateCSRFToken(sessionId);
};

export const getCSRFToken = (sessionId: string): string | null => {
  const state = TOKEN_STORE.get(sessionId);

  if (!state) {
    return null;
  }

  if (Date.now() - state.createdAt > TOKEN_EXPIRY) {
    TOKEN_STORE.delete(sessionId);
    return null;
  }

  return state.token;
};

export type SecurityCSRFRequestInput = {
  sessionId: string;
  method: string;
  token?: string | null;
  rotateToken?: boolean;
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

  if (!validateCSRFToken(input.sessionId, input.token)) {
    return { allow: false, reason: "invalid-token" };
  }

  if (input.rotateToken ?? true) {
    return {
      allow: true,
      reason: "valid-token",
      token: rotateCSRFToken(input.sessionId),
    };
  }

  return { allow: true, reason: "valid-token" };
};
