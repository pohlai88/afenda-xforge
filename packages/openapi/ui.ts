import type { OpenApiDocument } from "./spec.ts";

type HeadersInitValue = ConstructorParameters<typeof Headers>[0];

export type SwaggerUiHtmlOptions = {
  documentTitle?: string;
  heading?: string;
  specUrl: string;
  themeColor?: string;
};

export type OpenApiJsonResponseOptions = {
  cacheControl?: string;
  headers?: HeadersInitValue;
  pretty?: boolean;
};

const defaultCacheControl = "public, max-age=3600, must-revalidate";

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const createSwaggerUiHtml = ({
  documentTitle = "API Documentation",
  heading = "API Documentation",
  specUrl,
  themeColor = "#0f172a",
}: SwaggerUiHtmlOptions): string => {
  const safeTitle = escapeHtml(documentTitle);
  const safeHeading = escapeHtml(heading);
  const safeSpecUrl = escapeHtml(specUrl);
  const safeThemeColor = escapeHtml(themeColor);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>${safeTitle}</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
    <style>
      :root {
        color-scheme: light;
        --openapi-accent: ${safeThemeColor};
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background:
          radial-gradient(circle at top left, rgba(148, 163, 184, 0.18), transparent 28%),
          linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
        color: #0f172a;
        font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
      }

      .openapi-shell {
        min-height: 100vh;
      }

      .openapi-header {
        background: linear-gradient(135deg, var(--openapi-accent) 0%, #1e293b 100%);
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
        color: white;
        padding: 20px 24px;
      }

      .openapi-header h1 {
        font-size: 24px;
        letter-spacing: -0.03em;
        margin: 0;
      }

      .openapi-header p {
        color: rgba(255, 255, 255, 0.8);
        margin: 6px 0 0;
      }

      #swagger-ui {
        margin: 0 auto;
        max-width: 1320px;
        padding: 24px 12px 40px;
      }

      .swagger-ui .topbar {
        display: none;
      }

      .swagger-ui .scheme-container {
        border-radius: 18px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        margin: 0 0 20px;
      }

      .swagger-ui .info,
      .swagger-ui .scheme-container,
      .swagger-ui .opblock,
      .swagger-ui .responses-inner {
        background: rgba(255, 255, 255, 0.96);
      }

      .swagger-ui .btn.execute {
        background: var(--openapi-accent);
        border-color: var(--openapi-accent);
      }
    </style>
  </head>
  <body>
    <div class="openapi-shell">
      <header class="openapi-header">
        <h1>${safeHeading}</h1>
        <p>Interactive OpenAPI explorer</p>
      </header>
      <div id="swagger-ui"></div>
    </div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function() {
        window.ui = SwaggerUIBundle({
          url: "${safeSpecUrl}",
          dom_id: "#swagger-ui",
          deepLinking: true,
          displayRequestDuration: true,
          layout: "BaseLayout",
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          tryItOutEnabled: true
        });
      };
    </script>
  </body>
</html>`;
};

export const createOpenApiJsonResponse = (
  document: OpenApiDocument,
  options: OpenApiJsonResponseOptions = {}
): Response => {
  const headers = new Headers(options.headers);

  headers.set("access-control-allow-headers", "content-type");
  headers.set("access-control-allow-methods", "GET, OPTIONS");
  headers.set("access-control-allow-origin", "*");
  headers.set("cache-control", options.cacheControl ?? defaultCacheControl);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("x-robots-tag", "noindex, nofollow");

  return new Response(
    JSON.stringify(document, null, options.pretty === false ? undefined : 2),
    {
      status: 200,
      headers,
    }
  );
};

export const createSwaggerUiResponse = (
  options: SwaggerUiHtmlOptions
): Response => {
  const headers = new Headers();

  headers.set("access-control-allow-origin", "*");
  headers.set("cache-control", defaultCacheControl);
  headers.set("content-type", "text/html; charset=utf-8");
  headers.set("x-robots-tag", "noindex, nofollow");

  return new Response(createSwaggerUiHtml(options), {
    status: 200,
    headers,
  });
};
