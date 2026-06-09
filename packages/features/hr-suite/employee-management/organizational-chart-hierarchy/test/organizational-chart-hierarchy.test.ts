import assert from "node:assert/strict";
import { test } from "node:test";
import { createHrOrgMutationAuditEvent } from "../src/execution.ts";
import {
  canReadHrOrg,
  canWriteHrOrg,
  emptyHrOrgRepositoryState,
  hrOrgFeatureManifest,
  hrOrgRoutePaths,
  hrOrgStatusSchema,
  hrOrgUnitSchema,
  hrOrgUnitTypeSchema,
  organizationalChartHierarchyAuditEvents,
  organizationalChartHierarchyCapabilities,
  organizationalChartHierarchyFeatureId,
  organizationalChartHierarchyOwnedEntities,
  organizationalChartHierarchyRouteContracts,
  requireHrOrgWriteAccess,
  upsertHrOrgPositionInputSchema,
  upsertHrOrgReportingRelationshipInputSchema,
  upsertHrOrgUnitInputSchema,
} from "../src/index.ts";
import {
  loadHrOrgRepository,
  mutateHrOrgRepository,
  resetHrOrgRepositoryForTesting,
} from "../src/repository.ts";

test("slice 1 exposes canonical schemas while preserving legacy form schemas", () => {
  assert.equal(hrOrgUnitTypeSchema.parse("department"), "department");
  assert.equal(hrOrgStatusSchema.parse("active"), "active");

  const unit = upsertHrOrgUnitInputSchema.parse({
    code: "ENG",
    name: "Engineering",
    unitType: "department",
    status: "active",
    effectiveFrom: "2026-06-09",
  });

  assert.equal(unit.code, "ENG");
  assert.equal(unit.effectiveFrom instanceof Date, true);

  const position = upsertHrOrgPositionInputSchema.parse({
    code: "POS-001",
    title: "Engineering Manager",
    organizationUnitId: "unit-001",
    status: "planned",
  });

  assert.equal(position.organizationUnitId, "unit-001");

  const reportingLine = upsertHrOrgReportingRelationshipInputSchema.parse({
    employeeId: "emp-001",
    managerEmployeeId: "emp-002",
    relationshipType: "direct",
  });

  assert.equal(reportingLine.relationshipType, "direct");

  const legacyFormUnit = hrOrgUnitSchema.parse({
    code: "FIN",
    name: "Finance",
    unitType: "department",
    orgUnitStatus: "active",
  });

  assert.equal(legacyFormUnit.orgUnitStatus, "active");
});

test("slice 1 policy helpers fail closed and allow explicit read/write contexts", () => {
  assert.equal(canReadHrOrg({}), false);
  assert.equal(canWriteHrOrg({}), false);
  assert.deepEqual(requireHrOrgWriteAccess({ canWrite: false }), {
    ok: false,
    error: "Write access denied for organization structure",
  });

  assert.equal(canReadHrOrg({ canRead: true }), true);
  assert.equal(canWriteHrOrg({ canWrite: true }), true);
  assert.deepEqual(requireHrOrgWriteAccess({ canWrite: true }), { ok: true });
});

test("slice 1 execution helper creates scoped audit events", () => {
  const event = createHrOrgMutationAuditEvent(
    {
      action: organizationalChartHierarchyAuditEvents.unitUpserted,
      entityType: "organization_unit",
      entityId: "unit-001",
      summary: "Unit upserted",
    },
    {
      actorId: "hr-admin",
      canWrite: true,
      companyId: "acme",
      tenantId: "tenant-001",
    }
  );

  assert.equal(event.actorId, "hr-admin");
  assert.equal(event.companyId, "acme");
  assert.equal(event.tenantId, "tenant-001");
  assert.equal(event.metadata.surface, "organizational-chart-hierarchy");
});

test("slice 1 repository shape is separated by owned entity type", async () => {
  await resetHrOrgRepositoryForTesting();

  assert.deepEqual(await loadHrOrgRepository(), emptyHrOrgRepositoryState());

  await mutateHrOrgRepository((draft) => {
    draft.auditEvents.push(
      createHrOrgMutationAuditEvent({
        action: organizationalChartHierarchyAuditEvents.positionUpserted,
        entityType: "position",
        entityId: "position-001",
        summary: "Position upserted",
      })
    );
  });

  const snapshot = await loadHrOrgRepository();
  assert.equal(snapshot.auditEvents.length, 1);
  assert.equal(snapshot.units.length, 0);
  assert.equal(snapshot.positions.length, 0);
  assert.equal(snapshot.reportingRelationships.length, 0);
});

test("slice 1 exports registry and route compatibility metadata", () => {
  assert.equal(
    organizationalChartHierarchyFeatureId,
    "hr-suite.employee-management.organizational-chart-hierarchy"
  );
  assert.equal(
    organizationalChartHierarchyCapabilities.structureRead,
    "hr.organization_structure.read"
  );
  assert.equal(
    organizationalChartHierarchyOwnedEntities.includes("organization_unit"),
    true
  );
  assert.equal(hrOrgRoutePaths.org, "/hr/org");
  assert.equal(organizationalChartHierarchyRouteContracts.units.method, "GET");
  assert.equal(
    hrOrgFeatureManifest.packageName,
    "@repo/features-employee-management-organizational-chart-hierarchy"
  );
});
