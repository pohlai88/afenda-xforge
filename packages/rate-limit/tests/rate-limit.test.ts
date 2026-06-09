import assert from "node:assert/strict";
import test from "node:test";
import { ConfigurationError } from "@repo/errors";
import {
  applyRateLimitHeaders,
  assessRateLimitRequest,
  createConfiguredRateLimitProvider,
  createRateLimitContextFromRequest,
  createMemoryRateLimitProvider,
  createRateLimitMiddleware,
  createRateLimitPolicy,
  getClientIp,
  resolveRateLimitKey,
} from "../index.ts";

test("client IP ignores forwarded headers unless proxy trust is enabled", () => {
  const request = new Request("https://example.com/api", {
    headers: {
      "cf-connecting-ip": "198.51.100.10",
      "x-forwarded-for": "203.0.113.5, 198.51.100.1",
      "x-real-ip": "203.0.113.8",
    },
  });

  assert.equal(getClientIp(request), "198.51.100.10");
  assert.equal(
    getClientIp(
      new Request("https://example.com", {
        headers: {
          "x-forwarded-for": "203.0.113.5, 198.51.100.1",
          "x-real-ip": "203.0.113.8",
        },
      })
    ),
    null
  );
  assert.equal(getClientIp(request, { trustProxy: true }), "198.51.100.10");
  assert.equal(
    getClientIp(
      new Request("https://example.com/api", {
        headers: {
          "x-forwarded-for": "203.0.113.5, 198.51.100.1",
          "x-real-ip": "203.0.113.8",
        },
      }),
      { trustProxy: true }
    ),
    "203.0.113.8"
  );
});

test("request context respects explicit proxy trust opt-in", () => {
  const request = new Request("https://example.com/users", {
    headers: {
      "x-forwarded-for": "203.0.113.5",
    },
    method: "POST",
  });

  assert.deepEqual(createRateLimitContextFromRequest(request), {
    actorId: undefined,
    companyId: undefined,
    grantId: undefined,
    ip: undefined,
    keySuffix: undefined,
    method: "POST",
    route: "/users",
    tenantId: undefined,
    userId: undefined,
  });
  assert.equal(
    createRateLimitContextFromRequest(request, {}, { trustProxy: true }).ip,
    "203.0.113.5"
  );
});

test("rate limit key encoding preserves unique opaque identifiers", () => {
  const policy = createRateLimitPolicy({
    namespace: "xforge",
    scope: "user",
  });

  const slashKey = resolveRateLimitKey(policy, { userId: "User/A" });
  const dashKey = resolveRateLimitKey(policy, { userId: "user-a" });

  assert.notEqual(slashKey, dashKey);
  assert.match(slashKey, /User%2FA/);
});

test("route-scoped policies do not duplicate the route segment", () => {
  const policy = createRateLimitPolicy({
    namespace: "xforge",
    scope: "route",
    route: "/reports",
  });

  assert.equal(
    resolveRateLimitKey(policy, { method: "GET" }),
    "xforge:route:%2Freports:GET"
  );
});

test("policy rejects non-positive limits and windows", () => {
  assert.throws(
    () => createRateLimitPolicy({ limit: 0 }),
    /limit must be a positive integer/
  );
  assert.throws(
    () => createRateLimitPolicy({ windowSeconds: 0 }),
    /windowSeconds must be a positive integer/
  );
});

test("configured provider fails closed in production without Redis", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousRedisUrl = process.env.REDIS_URL;

  delete process.env.REDIS_URL;
  process.env.NODE_ENV = "production";

  try {
    assert.throws(
      () => createConfiguredRateLimitProvider(),
      ConfigurationError
    );
    assert.doesNotThrow(() =>
      createConfiguredRateLimitProvider({ allowMemoryFallback: true })
    );
  } finally {
    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }

    if (previousRedisUrl === undefined) {
      delete process.env.REDIS_URL;
    } else {
      process.env.REDIS_URL = previousRedisUrl;
    }
  }
});

test("middleware can attach headers to successful responses", async () => {
  const middleware = createRateLimitMiddleware({
    onAllowed: () => new Response("ok", { status: 200 }),
    provider: createMemoryRateLimitProvider(),
    policy: {
      includeHeaders: true,
      limit: 2,
      windowSeconds: 60,
    },
  });

  const response = await middleware(new Request("https://example.com/test"));

  assert.ok(response);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("RateLimit-Limit"), "2");
  assert.equal(response.headers.get("RateLimit-Remaining"), "1");
});

test("custom denied responses receive rate limit headers", async () => {
  const provider = createMemoryRateLimitProvider();
  const request = new Request("https://example.com/test");

  await assessRateLimitRequest(request, {
    provider,
    policy: {
      limit: 1,
      windowSeconds: 60,
    },
  });

  const assessment = await assessRateLimitRequest(request, {
    onDenied: () => new Response("blocked", { status: 429 }),
    provider,
    policy: {
      limit: 1,
      windowSeconds: 60,
    },
  });

  assert.equal(assessment.allowed, false);
  assert.equal(assessment.response?.headers.get("RateLimit-Limit"), "1");
  assert.ok(Number(assessment.response?.headers.get("Retry-After")) > 0);
});

test("applyRateLimitHeaders merges headers onto a response", () => {
  const response = applyRateLimitHeaders(
    new Response(null, { headers: { "x-test": "1" } }),
    new Headers({
      "RateLimit-Limit": "10",
      "RateLimit-Remaining": "9",
    })
  );

  assert.equal(response.headers.get("x-test"), "1");
  assert.equal(response.headers.get("RateLimit-Limit"), "10");
  assert.equal(response.headers.get("RateLimit-Remaining"), "9");
});
