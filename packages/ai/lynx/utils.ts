import type { XforgeAiModule, XforgeIntent } from "./types.js";

const vietnameseCharacterPattern = /[\u00C0-\u1EF9]/;

export const estimateTokens = (text: string): number => {
  if (text.length === 0) {
    return 0;
  }

  if (vietnameseCharacterPattern.test(text)) {
    return Math.ceil(text.length * 1.2);
  }

  return Math.ceil(text.split(/\s+/).filter(Boolean).length * 1.3);
};

export const truncateContext = (context: string, maxTokens: number): string => {
  const tokenEstimate = estimateTokens(context);

  if (tokenEstimate <= maxTokens || context.length === 0) {
    return context;
  }

  const ratio = maxTokens / tokenEstimate;
  const keepCharacters = Math.max(32, Math.floor(context.length * ratio));
  const head = Math.ceil(keepCharacters / 2);
  const tail = Math.floor(keepCharacters / 2);

  return `${context.slice(0, head)}\n...[truncated]...\n${context.slice(
    context.length - tail
  )}`;
};

export const classifyXforgeIntent = (message: string): XforgeIntent => {
  const lowerMessage = message.toLowerCase();

  const patterns: Array<{
    action: string;
    module: XforgeAiModule;
    regex: RegExp;
  }> = [
    {
      action: "search",
      module: "customers",
      regex:
        /customer|customers|khách hàng|khach hang|lead|contact|crm|buyer|account/i,
    },
    {
      action: "search",
      module: "companies",
      regex:
        /company|companies|doanh nghiệp|doanh nghiep|tenant|organization|org|workspace/i,
    },
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(lowerMessage)) {
      return {
        action: pattern.action,
        confidence: 0.86,
        module: pattern.module,
      };
    }
  }

  return {
    action: "chat",
    confidence: 0.5,
    module: "general",
  };
};
