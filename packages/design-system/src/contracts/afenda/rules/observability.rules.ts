import type { AfendaRuntimeRule } from "../runtime-reference.contract";

const OBSERVABILITY = "observability" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const STATIC = "static" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_OBSERVABILITY_RULES = [
  {
    id: "observability.structured-logs",
    category: OBSERVABILITY,
    severity: ERROR,
    appliesTo: ["server-action", "api-route", "command-handler", "background-job", "webhook"],
    forbidden: ["unstructured string log", "console.log in production path"],
    rationale:
      "Structured logs make production incidents searchable, filterable, and safe to correlate across systems.",
    requirement:
      "Server-side diagnostics must use structured logging with stable event names and metadata fields.",
    remediation:
      "Use the approved logger with event name, level, correlation id, scope, result, and safe metadata.",
    references: ["AFENDA:observability-contract", "XFORGE:execution-pipeline"],
    enforcement: HYBRID,
  },
  {
    id: "observability.diagnostic-event-naming",
    category: OBSERVABILITY,
    severity: WARNING,
    appliesTo: ["log", "metric", "trace", "diagnostic-event"],
    rationale:
      "Stable event names make diagnostics searchable across modules, tenants, and releases.",
    requirement:
      "Diagnostic events must use stable, namespaced event names.",
    remediation:
      "Use names such as module.action.started, module.action.succeeded, module.action.failed, or approved contract event names.",
    references: ["AFENDA:observability-contract"],
    enforcement: MANUAL,
  },
  {
    id: "observability.correlation-id-propagation",
    category: OBSERVABILITY,
    severity: ERROR,
    appliesTo: ["request", "server-action", "api-route", "background-job", "webhook", "audit-event"],
    rationale:
      "Correlation ids connect user actions, server execution, jobs, webhooks, logs, and audit records during incident review.",
    requirement:
      "Requests and async work must propagate correlation ids across execution boundaries.",
    remediation:
      "Create or accept a correlation id at the boundary and pass it through server actions, command handlers, jobs, webhooks, logs, and audit events.",
    references: ["AFENDA:observability-contract", "AFENDA:audit-contract"],
    enforcement: HYBRID,
  },
  {
    id: "observability.redaction",
    category: OBSERVABILITY,
    severity: ERROR,
    appliesTo: ["log", "trace", "metric-label", "error-report", "diagnostic-event"],
    forbidden: ["secret in log", "token in trace", "password in error report", "PII in metric label"],
    rationale:
      "Diagnostics must not become a secondary data leak path for secrets, credentials, or sensitive personal data.",
    requirement:
      "Observability payloads must redact secrets and avoid high-cardinality sensitive values.",
    remediation:
      "Use logger redaction, safe metadata allowlists, hashed identifiers, and avoid raw payload dumps.",
    references: ["AFENDA:observability-contract", "AFENDA:security-contract"],
    enforcement: HYBRID,
  },
  {
    id: "observability.no-raw-payload-logging",
    category: OBSERVABILITY,
    severity: ERROR,
    appliesTo: ["log", "trace", "error-report", "webhook", "api-route", "server-action"],
    forbidden: ["raw request body in log", "raw form data in log", "raw webhook payload in log", "raw response body in log"],
    rationale:
      "Raw payload logs can expose secrets, PII, credentials, and high-cardinality data.",
    requirement:
      "Logs and traces must record safe summaries instead of raw request, response, form, or webhook payloads.",
    remediation:
      "Log stable identifiers, result status, validation outcome, payload shape, and redacted metadata only.",
    references: ["AFENDA:observability-contract", "AFENDA:security-contract"],
    enforcement: HYBRID,
  },
  {
    id: "observability.error-boundaries",
    category: OBSERVABILITY,
    severity: ERROR,
    appliesTo: ["route", "page", "layout", "client-component", "async-boundary"],
    rationale:
      "Enterprise UI needs contained failure surfaces with actionable diagnostics instead of blank pages.",
    requirement:
      "User-facing route and async boundaries must provide governed error UI and diagnostic capture.",
    remediation:
      "Add error boundaries, scoped fallback UI, safe error ids, and diagnostic reporting for failed surfaces.",
    references: ["AFENDA:observability-contract", "AFENDA:feedback-contract"],
    enforcement: MANUAL,
  },
  {
    id: "observability.health-signals",
    category: OBSERVABILITY,
    severity: WARNING,
    appliesTo: ["service", "integration", "background-job", "webhook", "queue", "storage"],
    rationale:
      "Operators need basic health and failure signals for integrations and background execution.",
    requirement:
      "Critical services, jobs, and integrations should expose health, failure, retry, and latency signals.",
    remediation:
      "Emit metrics or status events for job success/failure, webhook delivery, retry count, latency, and dependency availability.",
    references: ["AFENDA:observability-contract", "XFORGE:execution-pipeline"],
    enforcement: MANUAL,
  },
  {
    id: "observability.no-console-production",
    category: OBSERVABILITY,
    severity: ERROR,
    appliesTo: ["client-component", "server-action", "api-route", "background-job", "library"],
    forbidden: ["console.log", "console.debug", "console.error without logger"],
    rationale:
      "Console calls bypass structured logging, redaction, severity controls, and production routing.",
    requirement:
      "Production code must use approved logging or diagnostic primitives instead of direct console calls.",
    remediation:
      "Replace console calls with the approved logger, test-only assertions, or explicit development-only guards.",
    references: ["AFENDA:observability-contract"],
    enforcement: STATIC,
  },
  {
    id: "observability.trace-async-work",
    category: OBSERVABILITY,
    severity: WARNING,
    appliesTo: ["server-action", "background-job", "webhook", "queue", "scheduled-task"],
    rationale:
      "Async work often fails away from the original request and needs traceable execution context.",
    requirement:
      "Async execution must preserve enough context to diagnose origin, retries, failure, and downstream effects.",
    remediation:
      "Propagate correlation id, actor or system identity, tenant/company scope where applicable, retry count, and source event metadata.",
    references: ["AFENDA:observability-contract", "AFENDA:audit-contract"],
    enforcement: MANUAL,
  },
  {
    id: "observability.user-safe-error-id",
    category: OBSERVABILITY,
    severity: WARNING,
    appliesTo: ["error-page", "toast", "alert", "support-flow", "error-boundary"],
    rationale:
      "Users and support teams need a safe reference for incident lookup without exposing internals.",
    requirement:
      "User-facing critical errors should expose a safe error id or support reference when diagnostics are captured.",
    remediation:
      "Generate a diagnostic id, show it in the error UI, and attach it to logs, traces, or support context.",
    references: ["AFENDA:observability-contract", "AFENDA:feedback-contract"],
    enforcement: MANUAL,
  },
] as const satisfies readonly AfendaRuntimeRule[];
