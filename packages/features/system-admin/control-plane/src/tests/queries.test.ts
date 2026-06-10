import assert from "node:assert/strict";
import test from "node:test";
import { createCustomizationFixture } from "@repo/customization";
import { systemAdminControlPlaneMetadata } from "../metadata.ts";
import {
  readSystemAdminOverview,
  reviewSystemAdminCustomizationImport,
} from "../queries.ts";

test("system admin overview denies users without admin permission", () => {
  assert.throws(
    () =>
      readSystemAdminOverview({
        grantedPermissions: [],
        tenantId: "tenant_1",
        userId: "user_1",
      }),
    /Missing required permission/
  );
});

test("system admin overview returns tenant-scoped sections", () => {
  const overview = readSystemAdminOverview({
    grantedPermissions: ["system-admin.overview.read"],
    tenantId: "tenant_1",
    userId: "user_1",
  });

  assert.equal(overview.tenantId, "tenant_1");
  assert.ok(overview.sections.length >= 1);
});

test("system admin customization review groups diagnostics for admin tooling", () => {
  assert.ok(systemAdminControlPlaneMetadata.id);

  const fixture = createCustomizationFixture({
    customization: {
      entity: systemAdminControlPlaneMetadata.entity,
      featureId: systemAdminControlPlaneMetadata.id,
      fields: [
        {
          key: "missing-field",
        },
      ],
      id: "system-admin.control-plane.tenant_1",
      scope: "tenant",
      tenantId: "tenant_1",
      title: "Tenant Admin Customization",
    },
    exportedAt: "2026-06-10T00:00:00.000Z",
    exportedBy: "admin-user",
    metadata: systemAdminControlPlaneMetadata,
  });

  const review = reviewSystemAdminCustomizationImport(
    fixture,
    systemAdminControlPlaneMetadata,
    "strict",
    {
      grantedPermissions: [
        "system-admin.overview.read",
        "system-admin.customization.read",
      ],
      tenantId: "tenant_1",
      userId: "user_1",
    }
  );

  assert.equal(review.status, "blocked");
  assert.equal(review.publishable, false);
  assert.ok(review.summary.totalCount >= 1);
  assert.ok(review.summary.byCategory.reference >= 1);
  assert.ok(
    review.items.some((item) => item.code === "customization.unknown_key")
  );
});

test("system admin customization review exposes stable node drift reasons", () => {
  assert.ok(systemAdminControlPlaneMetadata.id);
  const reviewMetadata = {
    ...systemAdminControlPlaneMetadata,
    fields: systemAdminControlPlaneMetadata.fields?.map((field) =>
      field.key === "title"
        ? {
            ...field,
            customization: {
              label: true,
            },
            id: "system-admin.control-plane.fields.title",
          }
        : field
    ),
  };
  assert.ok(reviewMetadata.id);

  const fixture = createCustomizationFixture({
    customization: {
      entity: reviewMetadata.entity,
      featureId: reviewMetadata.id,
      fields: [
        {
          id: "system-admin.control-plane.fields.title",
          key: "title",
          label: "Section Title",
        },
      ],
      id: "system-admin.control-plane.tenant_1",
      scope: "tenant",
      tenantId: "tenant_1",
      title: "Tenant Admin Customization",
    },
    exportedAt: "2026-06-10T00:00:00.000Z",
    exportedBy: "admin-user",
    metadata: reviewMetadata,
  });

  const review = reviewSystemAdminCustomizationImport(
    fixture,
    {
      ...reviewMetadata,
      fields: reviewMetadata.fields?.map((field) =>
        field.key === "title"
          ? {
              ...field,
              key: "section-title",
              kind: "select",
            }
          : field
      ),
    },
    "draft-with-warnings",
    {
      grantedPermissions: [
        "system-admin.overview.read",
        "system-admin.customization.read",
      ],
      tenantId: "tenant_1",
      userId: "user_1",
    }
  );

  assert.equal(review.status, "review");
  assert.ok(review.summary.byCategory.identity >= 1);
  assert.ok(review.summary.byCategory.layering >= 1);
  assert.ok(
    review.items.some(
      (item) =>
        item.code === "customization.node_renamed" &&
        item.reason === "node-renamed"
    )
  );
  assert.ok(
    review.items.some(
      (item) =>
        item.code === "customization.node_shape_drift" &&
        item.reason === "node-shape-drift"
    )
  );
});
