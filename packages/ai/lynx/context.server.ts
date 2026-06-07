import "server-only";

import { listCompanies } from "@repo/features-master-data-companies";
import { listCustomers } from "@repo/features-master-data-customers";
import type { TenantActorScope } from "@repo/shared";
import type {
  XforgeAssistantDefinition,
  XforgeContextBundle,
  XforgeContextCard,
  XforgeConversationContext,
  XforgeLanguage,
} from "./types.js";
import { estimateTokens, truncateContext } from "./utils.js";

const DEFAULT_CONTEXT_PAGE_SIZE = 5;

const summarizeList = <TItem>(
  title: string,
  source: string,
  items: readonly TItem[],
  total: number
): XforgeContextCard => ({
  data: {
    recent: items,
    total,
  },
  source,
  title,
  type: "metric",
});

const buildIntroLine = (
  language: XforgeLanguage,
  context: XforgeConversationContext
): string =>
  language === "vi"
    ? `Ngữ cảnh tenant: ${context.tenantId} | user: ${context.userId}${
        context.companyId ? ` | company: ${context.companyId}` : ""
      }`
    : `Tenant context: ${context.tenantId} | user: ${context.userId}${
        context.companyId ? ` | company: ${context.companyId}` : ""
      }`;

export const buildXforgeBusinessContext = async (
  context: XforgeConversationContext,
  options?: { maxContextTokens?: number }
): Promise<XforgeContextBundle> => {
  const scopedContext: TenantActorScope = {
    tenantId: context.tenantId,
    userId: context.userId,
  };
  const language: XforgeLanguage = context.language ?? "en";
  const warnings: string[] = [];
  const dataCards: XforgeContextCard[] = [];
  const summaryLines: string[] = [buildIntroLine(language, context)];

  const [customersResult, companiesResult] = await Promise.allSettled([
    listCustomers(
      {
        page: 1,
        pageSize: DEFAULT_CONTEXT_PAGE_SIZE,
      },
      scopedContext
    ),
    listCompanies(
      {
        page: 1,
        pageSize: DEFAULT_CONTEXT_PAGE_SIZE,
      },
      scopedContext
    ),
  ]);

  if (customersResult.status === "fulfilled") {
    const customers = customersResult.value;
    summaryLines.push(
      language === "vi"
        ? `Khách hàng: ${customers.total} tổng, ${customers.items.length} bản ghi gần nhất`
        : `Customers: ${customers.total} total, ${customers.items.length} recent records`
    );
    dataCards.push(
      summarizeList(
        "Customers",
        "master-data.customers",
        customers.items,
        customers.total
      )
    );
  } else {
    warnings.push(
      `customers context unavailable: ${String(
        customersResult.reason instanceof Error
          ? customersResult.reason.message
          : customersResult.reason
      )}`
    );
  }

  if (companiesResult.status === "fulfilled") {
    const companies = companiesResult.value;
    summaryLines.push(
      language === "vi"
        ? `Công ty: ${companies.total} tổng, ${companies.items.length} bản ghi gần nhất`
        : `Companies: ${companies.total} total, ${companies.items.length} recent records`
    );
    dataCards.push(
      summarizeList(
        "Companies",
        "master-data.companies",
        companies.items,
        companies.total
      )
    );
  } else {
    warnings.push(
      `companies context unavailable: ${String(
        companiesResult.reason instanceof Error
          ? companiesResult.reason.message
          : companiesResult.reason
      )}`
    );
  }

  if (context.metadata && Object.keys(context.metadata).length > 0) {
    summaryLines.push(
      language === "vi"
        ? `Metadata: ${JSON.stringify(context.metadata)}`
        : `Metadata: ${JSON.stringify(context.metadata)}`
    );
  }

  const contextString = summaryLines.join("\n");
  const tokenEstimate = estimateTokens(contextString);
  const maxContextTokens = options?.maxContextTokens;

  return {
    contextString:
      maxContextTokens == null
        ? contextString
        : truncateContext(contextString, maxContextTokens),
    dataCards,
    tokenEstimate,
    warnings,
  };
};

export const buildXforgeSystemPrompt = async (
  assistant: Pick<
    XforgeAssistantDefinition,
    "contextBuilder" | "name" | "systemPrompt"
  >,
  context: XforgeConversationContext,
  options?: { maxContextTokens?: number }
): Promise<string> => {
  const language: XforgeLanguage = context.language ?? "en";
  const bundle = await assistant.contextBuilder(context, options);
  const rules =
    language === "vi"
      ? [
          "- Trả lời ngắn gọn, rõ ràng, không bịa dữ liệu.",
          "- Nếu cần dữ liệu, hãy dùng tools thay vì suy đoán.",
          "- Giữ đúng tenant scope và chỉ nói về dữ liệu mà context cho phép.",
          "- Khi có warning về context, nêu giới hạn dữ liệu thay vì giả định.",
        ]
      : [
          "- Respond concisely and do not fabricate data.",
          "- Use tools whenever you need live records.",
          "- Keep tenant scope strict and only discuss accessible data.",
          "- If the context builder reports warnings, state the limitation instead of guessing.",
        ];

  const sections = [
    language === "vi"
      ? `Bạn là ${assistant.name}, trợ lý AI cho Xforge.`
      : `You are ${assistant.name}, the AI assistant for Xforge.`,
    assistant.systemPrompt.trim(),
    "",
    language === "vi" ? "--- Ngữ cảnh ---" : "--- Context ---",
    bundle.contextString,
    "",
    language === "vi" ? "--- Quy tắc ---" : "--- Rules ---",
    ...rules,
  ];

  if (bundle.warnings.length > 0) {
    sections.push(
      "",
      language === "vi"
        ? "--- Cảnh báo ngữ cảnh ---"
        : "--- Context warnings ---",
      ...bundle.warnings.map((warning) => `- ${warning}`)
    );
  }

  return sections.join("\n");
};
