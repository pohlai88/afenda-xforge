import assert from "node:assert/strict";
import test from "node:test";
import {
  systemAdminCapabilities,
  systemAdminReviewCustomizationRouteContract,
} from "../contract.ts";
import { systemAdminControlPlaneMetadata } from "../metadata.ts";

test("system admin metadata is declarative and permission hinted", () => {
  assert.equal(
    systemAdminControlPlaneMetadata.id,
    "system-admin.control-plane"
  );
  assert.equal(
    systemAdminControlPlaneMetadata.permissionHint?.claim,
    systemAdminCapabilities.overviewRead
  );
  assert.ok(systemAdminControlPlaneMetadata.actions?.length);
});

test("system admin capability keys are stable", () => {
  assert.equal(
    systemAdminCapabilities.customizationPublish,
    "system-admin.customization.publish"
  );
  assert.equal(
    systemAdminCapabilities.usersAccessWrite,
    "system-admin.users-access.write"
  );
});

test("system admin exposes customization review route contract", () => {
  assert.equal(
    systemAdminReviewCustomizationRouteContract.path,
    "/api/system-admin/customizations/review"
  );
  assert.equal(systemAdminReviewCustomizationRouteContract.method, "POST");
});
