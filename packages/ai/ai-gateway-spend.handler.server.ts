import { createLogger, getRequestContext } from "@repo/logger";
import { getRequestId, logServerEvent } from "@repo/logger/server";
import {
  getGatewaySpendReport,
  hasAiGatewayRuntimeCredentials,
} from "./ai-gateway.repository.server.ts";
import { aiHttpRoutes } from "./ai-http.contract.ts";
import { withAiSpan } from "./ai-tracing.repository.server.ts";

const logger = createLogger("ai");

type AiGatewaySpendInput = {
  organizationId: string;
};

const jsonResponse = (body: unknown, init: ResponseInit = {}): Response =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers ?? {}),
    },
  });

export async function handleAiGatewaySpendGet(
  request: Request,
  input: AiGatewaySpendInput
): Promise<Response> {
  const requestContext = getRequestContext();
  const requestId = requestContext?.requestId ?? getRequestId(request) ?? "";
  const route = aiHttpRoutes.gatewaySpend;

  if (!hasAiGatewayRuntimeCredentials()) {
    return jsonResponse({ available: false, entries: [] }, { status: 200 });
  }

  try {
    const report = await withAiSpan(
      "ai.spend.report",
      {
        feature: "assistant",
        model: "gateway-metrics",
        organizationId: input.organizationId,
        requestId,
      },
      () => getGatewaySpendReport({ organizationId: input.organizationId })
    );

    return jsonResponse(report, {
      status: 200,
      headers: { "Cache-Control": "private, max-age=300" },
    });
  } catch (error) {
    logServerEvent(
      logger,
      "error",
      "AI Gateway spend report failed.",
      {
        organizationId: input.organizationId,
        module: "system-admin",
        requestId,
        operationId: requestContext?.operationId ?? requestId,
        operation: "ai.spend.report",
      },
      {
        route,
        error: error instanceof Error ? error.message : String(error),
      }
    );

    return jsonResponse(
      { error: "AI Gateway spend report failed." },
      { status: 500 }
    );
  }
}
