import "server-only";

import { listCompanies } from "@repo/features-master-data-companies";
import { listCustomers } from "@repo/features-master-data-customers";
import type { TenantActorScope } from "@repo/shared";
import { z } from "zod";
import { buildXforgeBusinessContext } from "./context.server.js";
import type {
  XforgeAssistantDefinition,
  XforgeAssistantTool,
  XforgeConversationContext,
} from "./types.js";

const createSearchTool = <TInputSchema extends z.ZodTypeAny>(tool: {
  description: string;
  execute: (
    input: z.output<TInputSchema>,
    context: XforgeConversationContext
  ) => Promise<unknown> | unknown;
  inputSchema: TInputSchema;
  name: string;
}): XforgeAssistantTool<TInputSchema> => tool;

const customerSearchInputSchema = z.object({
  pageSize: z.number().int().min(1).max(20).default(5),
  query: z.string().trim().min(1),
});

const buildCustomerSearchTool = createSearchTool({
  name: "customers_search",
  description: "Search customer master data for a tenant.",
  inputSchema: customerSearchInputSchema,
  execute: async (
    input: z.output<typeof customerSearchInputSchema>,
    context: XforgeConversationContext
  ) => {
    const scopedContext: TenantActorScope = {
      tenantId: context.tenantId,
      userId: context.userId,
    };

    const result = await listCustomers(
      {
        page: 1,
        pageSize: input.pageSize,
        search: input.query,
      },
      scopedContext
    );

    return {
      items: result.items,
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
    };
  },
});

const companySearchInputSchema = z.object({
  pageSize: z.number().int().min(1).max(20).default(5),
  query: z.string().trim().min(1),
});

const buildCompanySearchTool = createSearchTool({
  name: "companies_search",
  description: "Search company master data for a tenant.",
  inputSchema: companySearchInputSchema,
  execute: async (
    input: z.output<typeof companySearchInputSchema>,
    context: XforgeConversationContext
  ) => {
    const scopedContext: TenantActorScope = {
      tenantId: context.tenantId,
      userId: context.userId,
    };

    const result = await listCompanies(
      {
        page: 1,
        pageSize: input.pageSize,
        search: input.query,
      },
      scopedContext
    );

    return {
      items: result.items,
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
    };
  },
});

const buildOverviewTool = createSearchTool({
  name: "workspace_overview",
  description:
    "Summarize customers and companies available to the current tenant.",
  inputSchema: z.object({}),
  execute: async (
    _input: Record<string, never>,
    context: XforgeConversationContext
  ) => {
    const bundle = await buildXforgeBusinessContext(context, {
      maxContextTokens: 600,
    });

    return {
      contextString: bundle.contextString,
      dataCards: bundle.dataCards,
      tokenEstimate: bundle.tokenEstimate,
      warnings: bundle.warnings,
    };
  },
});

export const generalAssistant: XforgeAssistantDefinition = {
  contextBuilder: buildXforgeBusinessContext,
  description:
    "Workspace assistant for general Xforge guidance, context, and routing.",
  module: "general",
  name: "Xforge General Lynx",
  systemPrompt:
    "General workspace guidance. Use the workspace context and any available tools to answer clearly, strictly within tenant scope.",
  tools: [buildOverviewTool],
};

export const customersAssistant: XforgeAssistantDefinition = {
  contextBuilder: buildXforgeBusinessContext,
  description: "Customer master-data assistant for search and summaries.",
  module: "customers",
  name: "Xforge Customers Lynx",
  systemPrompt:
    "Customer master-data guidance. Help users find customer records, summarize customer lists, and explain record scope without inventing data.",
  tools: [buildCustomerSearchTool, buildOverviewTool],
};

export const companiesAssistant: XforgeAssistantDefinition = {
  contextBuilder: buildXforgeBusinessContext,
  description: "Company master-data assistant for search and summaries.",
  module: "companies",
  name: "Xforge Companies Lynx",
  systemPrompt:
    "Company master-data guidance. Help users find company records, summarize company lists, and explain record scope without inventing data.",
  tools: [buildCompanySearchTool, buildOverviewTool],
};

export const defaultXforgeAssistants: readonly XforgeAssistantDefinition[] = [
  generalAssistant,
  customersAssistant,
  companiesAssistant,
];
