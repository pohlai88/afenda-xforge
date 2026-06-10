import assert from "node:assert/strict";
import test from "node:test";
import { permissionCatalog } from "@repo/permissions";
import {
  HR_CONSOLE_ID,
  assertDelegatableCapabilities,
  resolveModuleConsoleAccess,
  resolveModuleConsoleGovernanceMode,
} from "../governance.ts";

const companyId = "company_1";
const adminCaps = [
  permissionCatalog.systemAdmin.moduleConsolesRead,
  permissionCatalog.systemAdmin.moduleConsolesAssign,
  permissionCatalog.hrConsole.overviewRead,
];

test("unassigned fallback gives system admin full operator envelope", () => {
  const access = resolveModuleConsoleAccess({
    actorId: "admin_1",
    companyId,
    consoleId: HR_CONSOLE_ID,
    delegationGrants: [],
    operatorAssignments: [],
    tenantRole: "admin",
    tenantRoleCaps: adminCaps,
  });

  assert.equal(access.governanceMode, "unassigned_fallback");
  assert.equal(access.actingAsConsoleOperator, true);
  assert.equal(access.canDelegate, true);
  assert.equal(access.canDomainWrite, true);
  assert.ok(
    access.grantedCapabilities.includes(
      permissionCatalog.hrLam.leaveTypesWrite
    )
  );
});

test("operator assigned makes system admin read-only for delegation and domain writes", () => {
  const access = resolveModuleConsoleAccess({
    actorId: "admin_1",
    companyId,
    consoleId: HR_CONSOLE_ID,
    delegationGrants: [],
    operatorAssignments: [
      {
        capabilities: [permissionCatalog.hrConsole.delegationManage],
        companyId,
        consoleId: HR_CONSOLE_ID,
        operatorUserId: "operator_1",
      },
    ],
    tenantRole: "admin",
    tenantRoleCaps: adminCaps,
  });

  assert.equal(access.governanceMode, "operator_assigned");
  assert.equal(access.canDelegate, false);
  assert.equal(access.canDomainWrite, false);
  assert.ok(
    access.grantedCapabilities.includes(
      permissionCatalog.systemAdmin.moduleConsolesAssign
    )
  );
  assert.ok(
    !access.grantedCapabilities.includes(
      permissionCatalog.hrConsole.delegationManage
    )
  );
});

test("assigned operator can delegate and mutate domain capabilities", () => {
  const access = resolveModuleConsoleAccess({
    actorId: "operator_1",
    companyId,
    consoleId: HR_CONSOLE_ID,
    delegationGrants: [],
    operatorAssignments: [
      {
        capabilities: [
          permissionCatalog.hrConsole.delegationManage,
          permissionCatalog.hrLam.leaveTypesWrite,
        ],
        companyId,
        consoleId: HR_CONSOLE_ID,
        operatorUserId: "operator_1",
      },
    ],
    tenantRole: "member",
    tenantRoleCaps: [],
  });

  assert.equal(access.governanceMode, "operator_assigned");
  assert.equal(access.canDelegate, true);
  assert.equal(access.canDomainWrite, true);
});

test("revoking last operator returns to unassigned fallback mode", () => {
  const mode = resolveModuleConsoleGovernanceMode(
    [
      {
        companyId,
        consoleId: HR_CONSOLE_ID,
        operatorUserId: "operator_1",
        revokedAt: new Date().toISOString(),
      },
    ],
    HR_CONSOLE_ID,
    companyId
  );

  assert.equal(mode, "unassigned_fallback");
});

test("delegation grants merge onto grantee capabilities", () => {
  const access = resolveModuleConsoleAccess({
    actorId: "manager_1",
    companyId,
    consoleId: HR_CONSOLE_ID,
    delegationGrants: [
      {
        capabilities: [permissionCatalog.hrLam.leaveTypesWrite],
        companyId,
        granteeId: "manager_1",
        grantorId: "operator_1",
      },
    ],
    operatorAssignments: [
      {
        companyId,
        consoleId: HR_CONSOLE_ID,
        operatorUserId: "operator_1",
      },
    ],
    tenantRole: "manager",
    tenantRoleCaps: [],
  });

  assert.ok(
    access.grantedCapabilities.includes(
      permissionCatalog.hrLam.leaveTypesWrite
    )
  );
});

test("expired delegation grants do not merge capabilities", () => {
  const access = resolveModuleConsoleAccess({
    actorId: "manager_1",
    companyId,
    consoleId: HR_CONSOLE_ID,
    delegationGrants: [
      {
        capabilities: [permissionCatalog.hrLam.leaveTypesWrite],
        companyId,
        granteeId: "manager_1",
        grantorId: "operator_1",
        validTo: "2020-01-01T00:00:00.000Z",
      },
    ],
    operatorAssignments: [
      {
        companyId,
        consoleId: HR_CONSOLE_ID,
        operatorUserId: "operator_1",
      },
    ],
    tenantRole: "manager",
    tenantRoleCaps: [],
  });

  assert.ok(
    !access.grantedCapabilities.includes(
      permissionCatalog.hrLam.leaveTypesWrite
    )
  );
});

test("future delegation grants do not merge capabilities", () => {
  const access = resolveModuleConsoleAccess({
    actorId: "manager_1",
    companyId,
    consoleId: HR_CONSOLE_ID,
    delegationGrants: [
      {
        capabilities: [permissionCatalog.hrLam.calendarsWrite],
        companyId,
        granteeId: "manager_1",
        grantorId: "operator_1",
        validFrom: "2099-01-01T00:00:00.000Z",
      },
    ],
    operatorAssignments: [
      {
        companyId,
        consoleId: HR_CONSOLE_ID,
        operatorUserId: "operator_1",
      },
    ],
    tenantRole: "manager",
    tenantRoleCaps: [],
  });

  assert.ok(
    !access.grantedCapabilities.includes(
      permissionCatalog.hrLam.calendarsWrite
    )
  );
});

test("assigned operator without explicit capabilities receives full operator envelope", () => {
  const access = resolveModuleConsoleAccess({
    actorId: "operator_1",
    companyId,
    consoleId: HR_CONSOLE_ID,
    delegationGrants: [],
    operatorAssignments: [
      {
        companyId,
        consoleId: HR_CONSOLE_ID,
        operatorUserId: "operator_1",
      },
    ],
    tenantRole: "member",
    tenantRoleCaps: [],
  });

  assert.ok(
    access.grantedCapabilities.includes(
      permissionCatalog.hrLam.calendarsWrite
    )
  );
  assert.ok(
    access.grantedCapabilities.includes(
      permissionCatalog.hrLam.encashmentWrite
    )
  );
});

test("assigned operator with explicit capabilities receives only assigned envelope", () => {
  const access = resolveModuleConsoleAccess({
    actorId: "operator_1",
    companyId,
    consoleId: HR_CONSOLE_ID,
    delegationGrants: [],
    operatorAssignments: [
      {
        capabilities: [permissionCatalog.hrConsole.delegationManage],
        companyId,
        consoleId: HR_CONSOLE_ID,
        operatorUserId: "operator_1",
      },
    ],
    tenantRole: "member",
    tenantRoleCaps: [],
  });

  assert.ok(
    access.grantedCapabilities.includes(
      permissionCatalog.hrConsole.delegationManage
    )
  );
  assert.ok(
    !access.grantedCapabilities.includes(
      permissionCatalog.hrLam.calendarsWrite
    )
  );
});

test("operator cannot delegate capabilities outside their envelope", () => {
  assert.throws(
    () =>
      assertDelegatableCapabilities(
        resolveModuleConsoleAccess({
          actorId: "operator_1",
          companyId,
          consoleId: HR_CONSOLE_ID,
          delegationGrants: [],
          operatorAssignments: [
            {
              capabilities: [permissionCatalog.hrLam.leaveTypesWrite],
              companyId,
              consoleId: HR_CONSOLE_ID,
              operatorUserId: "operator_1",
            },
          ],
          tenantRole: "member",
          tenantRoleCaps: [],
        }),
        [permissionCatalog.hrLam.calendarsWrite]
      ),
    /Cannot grant capability outside operator envelope/
  );
});

test("expired operator assignments do not activate operator assigned mode", () => {
  const mode = resolveModuleConsoleGovernanceMode(
    [
      {
        companyId,
        consoleId: HR_CONSOLE_ID,
        operatorUserId: "operator_1",
        validTo: "2020-01-01T00:00:00.000Z",
      },
    ],
    HR_CONSOLE_ID,
    companyId
  );

  assert.equal(mode, "unassigned_fallback");
});
