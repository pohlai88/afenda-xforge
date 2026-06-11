import { registerCompanyOpenApi } from "@repo/features-master-data-companies/server";
import { registerCustomerOpenApi } from "@repo/features-master-data-customers/server";
import { registerMachineOpenApi } from "@repo/machine/contract";
import type { OpenApiDocument, OpenApiSchemaObject } from "@repo/openapi";
import {
  addOperation,
  addSchema,
  addTag,
  createOpenApiDocument,
} from "@repo/openapi";
import { registerWorkspaceShortcutsOpenApi } from "../../../lib/workspace-shortcuts/openapi.server.ts";
import { registerAuditOpenApi } from "../audit/_spec.ts";
import { registerAuditExportOpenApi } from "../audit/export/contract.ts";

const version: string =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
  process.env.npm_package_version ??
  "0.1.0";

const getServerUrl = (): string =>
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
  "http://localhost:3000";

const healthStatusSchema: OpenApiSchemaObject = {
  type: "string",
  enum: ["healthy", "degraded", "unhealthy"],
};

const dependencyHealthSchema: OpenApiSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: {
      type: "string",
    },
    status: {
      $ref: "#/components/schemas/HealthStatus",
    },
    responseTimeMs: {
      type: "number",
    },
    critical: {
      type: "boolean",
    },
    message: {
      type: "string",
    },
    details: {
      type: "object",
      additionalProperties: true,
    },
  },
  required: ["name", "status", "responseTimeMs", "critical"],
};

const probeResultSchema: OpenApiSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    status: {
      type: "string",
      enum: ["ok", "error"],
    },
    message: {
      type: "string",
    },
    checks: {
      type: "array",
      items: {
        $ref: "#/components/schemas/DependencyHealth",
      },
    },
  },
  required: ["status"],
};

const healthReportSchema: OpenApiSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    status: {
      $ref: "#/components/schemas/HealthStatus",
    },
    service: {
      type: "string",
    },
    version: {
      type: "string",
    },
    ready: {
      type: "boolean",
    },
    uptimeSeconds: {
      type: "number",
    },
    timestamp: {
      type: "string",
      format: "date-time",
    },
    dependencies: {
      type: "array",
      items: {
        $ref: "#/components/schemas/DependencyHealth",
      },
    },
    system: {
      type: "object",
      additionalProperties: false,
      properties: {
        arch: {
          type: "string",
        },
        cpuUsageMicros: {
          type: "object",
          additionalProperties: false,
          properties: {
            system: { type: "number" },
            user: { type: "number" },
          },
          required: ["system", "user"],
        },
        nodeVersion: {
          type: "string",
        },
        memoryUsageMb: {
          type: "object",
          additionalProperties: false,
          properties: {
            external: { type: "number" },
            heapTotal: { type: "number" },
            heapUsed: { type: "number" },
            rss: { type: "number" },
          },
          required: ["external", "heapTotal", "heapUsed", "rss"],
        },
        pid: {
          type: "number",
        },
        platform: {
          type: "string",
        },
      },
      required: [
        "arch",
        "cpuUsageMicros",
        "nodeVersion",
        "memoryUsageMb",
        "pid",
        "platform",
      ],
    },
  },
  required: [
    "status",
    "service",
    "version",
    "ready",
    "uptimeSeconds",
    "timestamp",
    "dependencies",
    "system",
  ],
};

const versionSchema: OpenApiSchemaObject = {
  type: "object",
  additionalProperties: false,
  properties: {
    service: {
      type: "string",
    },
    version: {
      type: "string",
    },
    nodeVersion: {
      type: "string",
    },
    environment: {
      type: "string",
    },
    startedAt: {
      type: "string",
      format: "date-time",
    },
    ready: {
      type: "boolean",
    },
    commitSha: {
      type: "string",
    },
    deploymentId: {
      type: "string",
    },
  },
  required: [
    "service",
    "version",
    "nodeVersion",
    "environment",
    "startedAt",
    "ready",
  ],
};

export const getAppOpenApiDocument = (): OpenApiDocument => {
  const document = createOpenApiDocument({
    info: {
      title: "Xforge API",
      version,
      description:
        "Current OpenAPI surface for Xforge. This documents operational endpoints plus the first governed client-facing feature routes.",
    },
    servers: [
      {
        url: getServerUrl(),
        description: "Primary app runtime",
      },
    ],
  });

  addSchema(document, "HealthStatus", healthStatusSchema);
  addSchema(document, "DependencyHealth", dependencyHealthSchema);
  addSchema(document, "ProbeResult", probeResultSchema);
  addSchema(document, "HealthReport", healthReportSchema);
  addSchema(document, "VersionInfo", versionSchema);

  addTag(document, {
    name: "health",
    description: "Runtime health and readiness probes",
  });
  addTag(document, {
    name: "metrics",
    description: "Prometheus metrics export",
  });
  addTag(document, {
    name: "openapi",
    description: "OpenAPI specification and interactive documentation",
  });
  addTag(document, {
    name: "audit",
    description: "Tenant-scoped audit event query endpoint",
  });
  addTag(document, {
    name: "ai",
    description: "Tenant-scoped assistant and AI usage endpoints",
  });
  addTag(document, {
    name: "companies",
    description: "Client-facing company master-data endpoints",
  });
  addTag(document, {
    name: "customers",
    description: "Client-facing customer master-data endpoints",
  });

  addOperation(document, "/api/health", "get", {
    summary: "Get the full health report",
    description:
      "Returns the aggregated application health report including dependency checks and process memory details.",
    operationId: "getHealthReport",
    tags: ["health"],
    responses: {
      "200": {
        description: "Service is healthy or degraded",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/HealthReport",
            },
          },
        },
      },
      "503": {
        description: "Service is unhealthy",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/HealthReport",
            },
          },
        },
      },
    },
  });

  addOperation(document, "/api/health/live", "get", {
    summary: "Get the liveness probe",
    operationId: "getHealthLiveness",
    tags: ["health"],
    responses: {
      "200": {
        description: "Liveness probe response",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ProbeResult",
            },
          },
        },
      },
    },
  });

  addOperation(document, "/api/health/ready", "get", {
    summary: "Get the readiness probe",
    operationId: "getHealthReadiness",
    tags: ["health"],
    responses: {
      "200": {
        description: "Ready to receive traffic",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ProbeResult",
            },
          },
        },
      },
      "503": {
        description: "One or more critical dependencies are unavailable",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ProbeResult",
            },
          },
        },
      },
    },
  });

  addOperation(document, "/api/health/startup", "get", {
    summary: "Get the startup probe",
    operationId: "getHealthStartup",
    tags: ["health"],
    responses: {
      "200": {
        description: "Startup probe response",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ProbeResult",
            },
          },
        },
      },
      "503": {
        description: "Service startup is still in progress",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ProbeResult",
            },
          },
        },
      },
    },
  });

  addOperation(document, "/api/health/version", "get", {
    summary: "Get version information",
    operationId: "getHealthVersion",
    tags: ["health"],
    responses: {
      "200": {
        description: "Version response",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/VersionInfo",
            },
          },
        },
      },
    },
  });

  addOperation(document, "/api/metrics", "get", {
    summary: "Get Prometheus metrics",
    description:
      "Exports Prometheus metrics in text exposition format for scraping.",
    operationId: "getMetrics",
    tags: ["metrics"],
    responses: {
      "200": {
        description: "Prometheus metrics payload",
        content: {
          "text/plain": {
            schema: {
              type: "string",
            },
          },
        },
      },
    },
  });

  addOperation(document, "/api/audit/export", "get", {
    summary: "Export audit events",
    description:
      "Exports tenant-scoped audit events as JSON or CSV for operator workflows.",
    operationId: "exportAuditEvents",
    tags: ["audit"],
    responses: {
      "200": {
        description: "Audit export payload",
        content: {
          "application/json": {
            schema: {
              type: "string",
            },
          },
          "text/csv": {
            schema: {
              type: "string",
            },
          },
        },
      },
    },
  });

  addOperation(document, "/api/openapi", "get", {
    summary: "Get the OpenAPI document",
    operationId: "getOpenApiDocument",
    tags: ["openapi"],
    responses: {
      "200": {
        description: "OpenAPI 3.1 JSON document",
        content: {
          "application/json": {
            schema: {
              type: "object",
              additionalProperties: true,
            },
          },
        },
      },
    },
  });

  addOperation(document, "/api/openapi/ui", "get", {
    summary: "Get the interactive Swagger UI",
    operationId: "getOpenApiUi",
    tags: ["openapi"],
    responses: {
      "200": {
        description: "Swagger UI HTML page",
        content: {
          "text/html": {
            schema: {
              type: "string",
            },
          },
        },
      },
    },
  });

  registerCompanyOpenApi(document);
  registerCustomerOpenApi(document);
  registerMachineOpenApi(document);
  registerAuditOpenApi(document);
  registerAuditExportOpenApi(document);
  registerWorkspaceShortcutsOpenApi(document);

  return document;
};
