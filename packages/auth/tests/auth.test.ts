import assert from "node:assert/strict";
import test from "node:test";
import { resolveTenantSlugFromHost } from "../host.ts";

test("tenant host resolution rejects reserved and apex hosts", () => {
  assert.equal(resolveTenantSlugFromHost("example.com"), null);
  assert.equal(resolveTenantSlugFromHost("www.example.com"), null);
  assert.equal(resolveTenantSlugFromHost("app.example.com"), null);
  assert.equal(resolveTenantSlugFromHost("localhost:3000"), null);
});

test("tenant host resolution supports local tenant subdomains", () => {
  assert.equal(resolveTenantSlugFromHost("acme.localhost:3000"), "acme");
});

test("tenant host resolution can be constrained to an app base domain", () => {
  assert.equal(
    resolveTenantSlugFromHost("acme.xforge.test", {
      appBaseDomain: "xforge.test",
    }),
    "acme"
  );
  assert.equal(
    resolveTenantSlugFromHost("acme.other.test", {
      appBaseDomain: "xforge.test",
    }),
    null
  );
});
