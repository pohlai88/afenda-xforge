import assert from "node:assert/strict";
import test from "node:test";
import {
  applySecurityCorsHeaders,
  assessErpRequestBoundary,
  createContentSecurityPolicy,
  createCSRFDecision,
  createSecurityCorsConfig,
  createSignedCSRFToken,
  keys,
  validateSignedCSRFToken,
} from "../index.ts";

test("security boolean env values use env-style parsing", () => {
  const previous = process.env.SECURITY_ALLOW_UNSAFE_METHODS;
  process.env.SECURITY_ALLOW_UNSAFE_METHODS = "false";

  try {
    assert.equal(keys().SECURITY_ALLOW_UNSAFE_METHODS, false);
    process.env.SECURITY_ALLOW_UNSAFE_METHODS = "1";
    assert.equal(keys().SECURITY_ALLOW_UNSAFE_METHODS, true);
  } finally {
    if (previous === undefined) {
      delete process.env.SECURITY_ALLOW_UNSAFE_METHODS;
    } else {
      process.env.SECURITY_ALLOW_UNSAFE_METHODS = previous;
    }
  }
});

test("security CORS denies missing or unknown origins by default", () => {
  const config = createSecurityCorsConfig();

  assert.deepEqual(applySecurityCorsHeaders({}, config), {
    "Access-Control-Allow-Methods": "GET, HEAD, PUT, PATCH, POST, DELETE",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
    "Access-Control-Expose-Headers": "X-Total-Count, X-Page, X-Page-Size",
  });
});

test("security CORS allows configured origins and emits Vary", () => {
  const headers = applySecurityCorsHeaders(
    {},
    createSecurityCorsConfig({
      origin: ["https://tenant.example.com"],
      credentials: true,
    }),
    "https://tenant.example.com"
  );

  assert.equal(
    headers["Access-Control-Allow-Origin"],
    "https://tenant.example.com"
  );
  assert.equal(headers["Access-Control-Allow-Credentials"], "true");
  assert.equal(headers.Vary, "Origin");
});

test("content security policy has ERP-safe defaults", () => {
  assert.equal(
    createContentSecurityPolicy(),
    "default-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'"
  );
});

test("signed CSRF token validates session and user binding", () => {
  const token = createSignedCSRFToken({
    now: 1000,
    secret: "csrf-secret",
    sessionId: "session-1",
    userId: "user-1",
  });

  assert.equal(
    validateSignedCSRFToken({
      now: 2000,
      secret: "csrf-secret",
      sessionId: "session-1",
      token,
      userId: "user-1",
    }),
    true
  );
  assert.equal(
    validateSignedCSRFToken({
      now: 2000,
      secret: "csrf-secret",
      sessionId: "session-2",
      token,
      userId: "user-1",
    }),
    false
  );
});

test("CSRF decision rejects unsafe missing token and rotates valid token", () => {
  const token = createSignedCSRFToken({
    now: 1000,
    secret: "csrf-secret",
    sessionId: "session-1",
  });

  assert.deepEqual(
    createCSRFDecision({
      method: "POST",
      secret: "csrf-secret",
      sessionId: "session-1",
    }),
    { allow: false, reason: "missing-token" }
  );

  const decision = createCSRFDecision({
    method: "POST",
    now: 2000,
    secret: "csrf-secret",
    sessionId: "session-1",
    token,
  });

  assert.equal(decision.allow, true);
  assert.equal(decision.reason, "valid-token");
  assert.equal(typeof decision.token, "string");
});

test("ERP request boundary issues CSRF token for safe authenticated browser requests", () => {
  const decision = assessErpRequestBoundary(
    new Request("https://app.example.test/api/customers", {
      headers: {
        cookie: "sb-session=present",
      },
      method: "GET",
    }),
    {
      csrf: {
        secret: "csrf-secret-with-enough-length",
        sessionId: "session-1",
      },
    }
  );

  assert.equal(decision.allow, true);
  assert.equal(decision.cookies.length, 1);
  assert.equal(decision.cookies[0]?.name, "xforge_csrf");
});

test("ERP request boundary rejects unsafe browser requests without double-submit token", () => {
  const decision = assessErpRequestBoundary(
    new Request("https://app.example.test/api/customers", {
      headers: {
        cookie: "sb-session=present",
        origin: "https://app.example.test",
      },
      method: "POST",
    }),
    {
      csrf: {
        secret: "csrf-secret-with-enough-length",
        sessionId: "session-1",
      },
    }
  );

  assert.equal(decision.allow, false);
  assert.equal(decision.reason, "csrf-double-submit-mismatch");
});

test("ERP request boundary allows valid unsafe browser double-submit token", () => {
  const token = createSignedCSRFToken({
    now: 1000,
    secret: "csrf-secret-with-enough-length",
    sessionId: "session-1",
    userId: "user-1",
  });
  const decision = assessErpRequestBoundary(
    new Request("https://app.example.test/api/customers", {
      headers: {
        cookie: `xforge_csrf=${encodeURIComponent(token)}`,
        origin: "https://app.example.test",
        "x-csrf-token": token,
      },
      method: "POST",
    }),
    {
      csrf: {
        secret: "csrf-secret-with-enough-length",
        sessionId: "session-1",
        userId: "user-1",
      },
      now: 2000,
    }
  );

  assert.equal(decision.allow, true);
  assert.equal(decision.reason, "valid-token");
  assert.equal(decision.cookies.length, 1);
});
