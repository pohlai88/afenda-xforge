import type { RequestSecurityDecision } from "./request.ts";

export type SecurityProviderContext = {
  request: Request;
  policyName: string;
};

export type SecurityProvider = {
  assess: (
    context: SecurityProviderContext
  ) => Promise<RequestSecurityDecision> | RequestSecurityDecision;
};

export const createNoopSecurityProvider = (): SecurityProvider => ({
  assess: async (): Promise<RequestSecurityDecision> => ({
    allow: true,
    reason: "noop-provider",
    riskSignals: [],
  }),
});
