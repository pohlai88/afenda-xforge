import assert from "node:assert/strict";
import { test } from "node:test";
import {
  employeeLifecycleManagementAcceptanceCoverage,
  employeeLifecycleManagementBoundedContext,
  employeeLifecycleManagementCapabilityCatalog,
  employeeLifecycleManagementFeatureId,
  employeeLifecycleManagementFeatureLabel,
  employeeLifecycleManagementFeatureScope,
  employeeLifecycleManagementReadPermission,
  employeeLifecycleManagementRequirementCoverage,
  employeeLifecycleManagementRouteContracts,
  employeeLifecycleManagementRoutePaths,
  employeeLifecycleManagementSensitiveReadPermission,
  employeeLifecycleManagementWritePermission,
  hrLifecycleRoutePaths,
  hrWorkforceLifecycleReadPermission,
} from "../src/contract.ts";
import { employeeLifecycleManagementManifest } from "../src/manifest.ts";
import { employeeLifecycleManagementMetadata } from "../src/metadata.ts";

test("exposes a coherent feature identity and scope", () => {
  assert.equal(
    employeeLifecycleManagementFeatureId,
    "hr-suite.employee-management.employee-lifecycle-management"
  );
  assert.equal(
    employeeLifecycleManagementFeatureLabel,
    "Employee Lifecycle Management"
  );
  assert.equal(
    employeeLifecycleManagementFeatureScope.source,
    "legacy-hr-suite"
  );
  assert.equal(
    employeeLifecycleManagementFeatureScope.domain,
    "employee-management"
  );
  assert.equal(
    employeeLifecycleManagementFeatureScope.feature,
    "employee-lifecycle-management"
  );
});

test("defines the public permissions and route contracts", () => {
  assert.equal(employeeLifecycleManagementReadPermission.function, "read");
  assert.equal(employeeLifecycleManagementWritePermission.function, "write");
  assert.equal(
    employeeLifecycleManagementSensitiveReadPermission.function,
    "sensitive.read"
  );
  assert.strictEqual(
    hrWorkforceLifecycleReadPermission,
    employeeLifecycleManagementReadPermission
  );
  assert.deepEqual(hrLifecycleRoutePaths, {
    hub: "/hr",
    lifecycle: "/hr/lifecycle",
  });
  assert.equal(
    employeeLifecycleManagementRoutePaths.detail("emp-123"),
    "/hr/lifecycle/emp-123"
  );
  assert.equal(
    employeeLifecycleManagementRouteContracts.overview.path,
    "/api/hr/lifecycle/overview"
  );
  assert.equal(
    employeeLifecycleManagementRouteContracts.transitions.method,
    "POST"
  );
});

test("provides a bounded context, capability catalog, and coverage map", () => {
  assert.equal(
    employeeLifecycleManagementBoundedContext.exclusions.includes(
      "payroll-calculation"
    ),
    true
  );
  assert.ok(employeeLifecycleManagementCapabilityCatalog.length > 0);
  assert.equal(
    employeeLifecycleManagementRequirementCoverage.at(0),
    "HRM-LCY-001"
  );
  assert.equal(employeeLifecycleManagementAcceptanceCoverage.at(-1), "AC-020");
});

test("keeps manifest and metadata aligned with the package identity", () => {
  assert.equal(
    employeeLifecycleManagementManifest.id,
    employeeLifecycleManagementFeatureId
  );
  assert.equal(
    employeeLifecycleManagementManifest.title,
    employeeLifecycleManagementFeatureLabel
  );
  assert.strictEqual(
    employeeLifecycleManagementManifest.routeContracts,
    employeeLifecycleManagementRouteContracts
  );
  assert.equal(
    employeeLifecycleManagementMetadata.id,
    employeeLifecycleManagementFeatureId
  );
  assert.equal(
    employeeLifecycleManagementMetadata.labels.singular,
    "employee lifecycle record"
  );
  assert.equal(employeeLifecycleManagementMetadata.visibility, "internal");
});
