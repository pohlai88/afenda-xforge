/**
 * Canonical AI HTTP paths — ARCH-1004 §5 (internal scope + plane).
 */
export const aiHttpRoutes = {
  assistant: "/api/internal/v1/ai/queries/assistant",
  gatewaySpend: "/api/internal/v1/ai/queries/gateway-spend",
  extractDocument: "/api/internal/v1/ai/commands/extract-document",
} as const;

export type AiHttpRoute = (typeof aiHttpRoutes)[keyof typeof aiHttpRoutes];
