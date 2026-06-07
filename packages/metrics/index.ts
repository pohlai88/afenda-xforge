import "server-only";

import {
  Counter,
  collectDefaultMetrics as collectDefaultMetricsFn,
  Histogram,
  Registry as PromRegistry,
} from "prom-client";

export type RouteHandler = (request: Request) => Promise<Response> | Response;

export type HttpRequestMetricInput = {
  app?: string;
  durationSeconds: number;
  method: string;
  route: string;
  statusCode: number;
};

export type DatabaseQueryMetricInput = {
  app?: string;
  durationSeconds: number;
  operation: string;
  resource: string;
};

export type EventMetricInput = {
  app?: string;
  subject: string;
  type: string;
};

export type CacheMetricInput = {
  app?: string;
  operation: string;
};

const metricsRegistry = new PromRegistry();

collectDefaultMetricsFn({ register: metricsRegistry });

const httpRequestLabelNames = [
  "method",
  "route",
  "status_code",
  "app",
] as const;
const databaseQueryLabelNames = ["operation", "resource", "app"] as const;
const eventLabelNames = ["subject", "type", "app"] as const;
const cacheLabelNames = ["operation", "app"] as const;

export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: httpRequestLabelNames,
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [metricsRegistry],
});

export const httpRequestTotal = new Counter({
  name: "http_request_total",
  help: "Total number of HTTP requests",
  labelNames: httpRequestLabelNames,
  registers: [metricsRegistry],
});

export const dbQueryDuration = new Histogram({
  name: "db_query_duration_seconds",
  help: "Duration of database queries in seconds",
  labelNames: databaseQueryLabelNames,
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [metricsRegistry],
});

export const eventTotal = new Counter({
  name: "event_total",
  help: "Total number of events processed",
  labelNames: eventLabelNames,
  registers: [metricsRegistry],
});

export const cacheHitTotal = new Counter({
  name: "cache_hit_total",
  help: "Total number of cache hits",
  labelNames: cacheLabelNames,
  registers: [metricsRegistry],
});

const toStatusCodeLabel = (statusCode: number): string => String(statusCode);

export const recordHttpRequest = ({
  app = "default",
  durationSeconds,
  method,
  route,
  statusCode,
}: HttpRequestMetricInput): void => {
  const statusCodeLabel = toStatusCodeLabel(statusCode);

  httpRequestDuration
    .labels(method, route, statusCodeLabel, app)
    .observe(durationSeconds);
  httpRequestTotal.labels(method, route, statusCodeLabel, app).inc();
};

export const recordDatabaseQuery = ({
  app = "default",
  durationSeconds,
  operation,
  resource,
}: DatabaseQueryMetricInput): void => {
  dbQueryDuration.labels(operation, resource, app).observe(durationSeconds);
};

export const timeDatabaseQuery = async <T>(
  input: Omit<DatabaseQueryMetricInput, "durationSeconds">,
  run: () => Promise<T>
): Promise<T> => {
  const startedAt = Date.now();

  try {
    return await run();
  } finally {
    recordDatabaseQuery({
      ...input,
      durationSeconds: (Date.now() - startedAt) / 1000,
    });
  }
};

export const recordEvent = ({
  app = "default",
  subject,
  type,
}: EventMetricInput): void => {
  eventTotal.labels(subject, type, app).inc();
};

export const recordCacheHit = ({
  app = "default",
  operation,
}: CacheMetricInput): void => {
  cacheHitTotal.labels(operation, app).inc();
};

export const metricsHandler = async (): Promise<string> =>
  metricsRegistry.metrics();

export const metricsResponse = async (): Promise<Response> =>
  new Response(await metricsHandler(), {
    headers: {
      "cache-control": "no-store",
      "content-type": metricsRegistry.contentType,
    },
  });

export const withMetrics =
  (handler: RouteHandler, app = "default"): RouteHandler =>
  async (request: Request): Promise<Response> => {
    const startedAt = Date.now();
    const route = new URL(request.url).pathname;
    const method = request.method;

    try {
      const response = await handler(request);

      recordHttpRequest({
        app,
        durationSeconds: (Date.now() - startedAt) / 1000,
        method,
        route,
        statusCode: response.status,
      });

      return response;
    } catch (error) {
      recordHttpRequest({
        app,
        durationSeconds: (Date.now() - startedAt) / 1000,
        method,
        route,
        statusCode: 500,
      });

      throw error;
    }
  };

export { collectDefaultMetrics, Registry } from "prom-client";
export { metricsRegistry };
