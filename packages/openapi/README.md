# `@repo/openapi`

Minimal OpenAPI document builder and Next.js route helpers for Xforge.

## What it provides

- typed OpenAPI 3.1 document scaffolding
- helpers for tags, schemas, security schemes, and operations
- JSON spec route creation
- Swagger UI HTML route creation

## Intended usage

Keep the package generic. Build concrete specs in the app layer so they can describe real routes, env-specific servers, and feature-package behavior without coupling `@repo/openapi` to one app.

Example:

```ts
import {
  addOperation,
  addTag,
  createOpenApiDocument,
} from "@repo/openapi";

const document = createOpenApiDocument({
  info: {
    title: "Xforge API",
    version: "0.1.0",
  },
});

addTag(document, {
  name: "health",
  description: "Operational health endpoints",
});

addOperation(document, "/api/health", "get", {
  summary: "Get the full health report",
  tags: ["health"],
  responses: {
    "200": {
      description: "Healthy or degraded service",
    },
    "503": {
      description: "Unhealthy service",
    },
  },
});
```
