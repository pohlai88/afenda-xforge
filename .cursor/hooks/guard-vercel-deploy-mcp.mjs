#!/usr/bin/env node
/**
 * beforeMCPExecution — vercel-deployment.mdc: ask before Vercel MCP deploy.
 */
import { emit, log, parseStdinJson } from "./_hook-utils.mjs";

const TAG = "guard-vercel-deploy-mcp";

const DEPLOY_TOOLS = /\bdeploy_to_vercel\b/i;

const input = parseStdinJson();

if (input === null) {
  log(TAG, "invalid stdin JSON; allowing");
  emit({ permission: "allow" });
  process.exit(0);
}

const toolName =
  input.tool_name ??
  input.toolName ??
  input.name ??
  input.mcp_tool ??
  "";

const serverName = input.server ?? input.mcp_server ?? "";

const haystack = `${serverName} ${toolName} ${JSON.stringify(input.arguments ?? {})}`;

if (!DEPLOY_TOOLS.test(haystack)) {
  emit({ permission: "allow" });
  process.exit(0);
}

log(TAG, `flagged MCP deploy: ${toolName || haystack.slice(0, 80)}`);

emit({
  permission: "ask",
  user_message:
    "Agent is about to deploy via Vercel MCP. Confirm deploy target (preview vs production) before continuing.",
  agent_message:
    "Vercel MCP deploy blocked pending approval (vercel-deployment.mdc). Pre-flight: pnpm --filter app check:stability && pnpm --filter app build. After deploy use get_deployment / get_deployment_build_logs. For platform questions use search_vercel_documentation.",
});

process.exit(0);
