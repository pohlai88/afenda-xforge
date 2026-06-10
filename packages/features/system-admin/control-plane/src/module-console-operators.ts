import "server-only";

import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import {
  companies,
  database,
  moduleConsoleOperatorAssignments,
  timeDatabaseQuery,
} from "@repo/database";
import { requirePermission } from "@repo/permissions";
import { and, eq, isNull } from "drizzle-orm";
import { systemAdminCapabilities } from "./contract.ts";
import { createSystemAdminPermissionContext } from "./feature-scope.ts";
import {
  resolveDefaultModuleConsoleOperatorCapabilities,
} from "./module-console-registry.ts";
import type { SystemAdminScope } from "./schema.ts";

const repositoryFilePath = resolve(
  process.cwd(),
  ".data/module-console-operator-assignments.json"
);

export type ModuleConsoleOperatorAssignment = Readonly<{
  assignedBy: string;
  capabilities: readonly string[];
  companyId: string;
  consoleId: string;
  createdAt: string;
  id: string;
  operatorUserId: string;
  reason?: string;
  revokedAt?: string;
  tenantId: string;
  validFrom?: string;
  validTo?: string;
}>;

export type AssignModuleConsoleOperatorInput = Readonly<{
  capabilities?: readonly string[];
  companyId: string;
  consoleId: string;
  operatorUserId: string;
  reason: string;
  validFrom?: string;
  validTo?: string;
}>;

export type RevokeModuleConsoleOperatorInput = Readonly<{
  assignmentId: string;
  reason: string;
}>;

type OperatorAssignmentStore = {
  assignments: ModuleConsoleOperatorAssignment[];
};

const isDatabaseRepositoryModeConfigured = (): boolean =>
  process.env.AFENDA_MODULE_CONSOLE_REPOSITORY_MODE !== "file" &&
  Boolean(process.env.DATABASE_URL);

const emptyStore = (): OperatorAssignmentStore => ({
  assignments: [],
});

const ensureRepositoryDirectory = (): void => {
  mkdirSync(dirname(repositoryFilePath), { recursive: true });
};

const readStoreFromDisk = (): OperatorAssignmentStore => {
  if (!existsSync(repositoryFilePath)) {
    return emptyStore();
  }

  const parsed = JSON.parse(
    readFileSync(repositoryFilePath, "utf8")
  ) as OperatorAssignmentStore;

  return {
    assignments: parsed.assignments ?? [],
  };
};

const writeStoreToDisk = (store: OperatorAssignmentStore): void => {
  ensureRepositoryDirectory();
  const tempPath = `${repositoryFilePath}.${randomUUID()}.tmp`;
  writeFileSync(tempPath, JSON.stringify(store, null, 2), "utf8");
  renameSync(tempPath, repositoryFilePath);
};

const requireModuleConsoleAssignPermission = (
  context: SystemAdminScope
): void => {
  requirePermission(
    createSystemAdminPermissionContext(
      context,
      systemAdminCapabilities.moduleConsolesAssign,
      "system-admin.module-consoles"
    ),
    {
      allOf: [systemAdminCapabilities.moduleConsolesAssign],
    }
  );
};

const requireModuleConsoleReadPermission = (
  context: SystemAdminScope
): void => {
  requirePermission(
    createSystemAdminPermissionContext(
      context,
      systemAdminCapabilities.moduleConsolesRead,
      "system-admin.module-consoles"
    ),
    {
      allOf: [systemAdminCapabilities.moduleConsolesRead],
    }
  );
};

const validateCompanyInTenant = async (
  tenantId: string,
  companyId: string
): Promise<boolean> => {
  const [company] = await timeDatabaseQuery(
    () =>
      database
        .select({ id: companies.id })
        .from(companies)
        .where(
          and(eq(companies.id, companyId), eq(companies.tenantId, tenantId))
        )
        .limit(1),
    {
      operation: "select",
      resource: "companies",
      metadata: {
        companyId,
        tenantId,
      },
    }
  );

  return Boolean(company);
};

const mapAssignmentRow = (row: {
  assignedBy: string;
  capabilities: string[] | null;
  companyId: string;
  consoleId: string;
  createdAt: Date;
  id: string;
  operatorUserId: string;
  reason: string | null;
  revokedAt: Date | null;
  tenantId: string;
  validFrom: Date | null;
  validTo: Date | null;
}): ModuleConsoleOperatorAssignment => ({
  assignedBy: row.assignedBy,
  capabilities: row.capabilities ?? [],
  companyId: row.companyId,
  consoleId: row.consoleId,
  createdAt: row.createdAt.toISOString(),
  id: row.id,
  operatorUserId: row.operatorUserId,
  ...(row.reason ? { reason: row.reason } : {}),
  ...(row.revokedAt ? { revokedAt: row.revokedAt.toISOString() } : {}),
  tenantId: row.tenantId,
  ...(row.validFrom ? { validFrom: row.validFrom.toISOString() } : {}),
  ...(row.validTo ? { validTo: row.validTo.toISOString() } : {}),
});

const listActiveAssignmentsFromStore = (
  tenantId: string,
  consoleId?: string,
  companyId?: string
): ModuleConsoleOperatorAssignment[] =>
  readStoreFromDisk().assignments.filter(
    (assignment) =>
      assignment.tenantId === tenantId &&
      !assignment.revokedAt &&
      (!consoleId || assignment.consoleId === consoleId) &&
      (!companyId || assignment.companyId === companyId)
  );

export const listModuleConsoleOperatorAssignments = async (
  context: SystemAdminScope,
  query: {
    companyId?: string;
    consoleId?: string;
  } = {}
): Promise<ModuleConsoleOperatorAssignment[]> => {
  requireModuleConsoleReadPermission(context);

  if (!isDatabaseRepositoryModeConfigured()) {
    return listActiveAssignmentsFromStore(
      context.tenantId,
      query.consoleId,
      query.companyId
    );
  }

  const conditions = [
    eq(moduleConsoleOperatorAssignments.tenantId, context.tenantId),
    isNull(moduleConsoleOperatorAssignments.revokedAt),
  ];

  if (query.consoleId) {
    conditions.push(
      eq(moduleConsoleOperatorAssignments.consoleId, query.consoleId)
    );
  }

  if (query.companyId) {
    conditions.push(
      eq(moduleConsoleOperatorAssignments.companyId, query.companyId)
    );
  }

  const rows = await timeDatabaseQuery(
    () =>
      database
        .select({
          assignedBy: moduleConsoleOperatorAssignments.assignedBy,
          capabilities: moduleConsoleOperatorAssignments.capabilities,
          companyId: moduleConsoleOperatorAssignments.companyId,
          consoleId: moduleConsoleOperatorAssignments.consoleId,
          createdAt: moduleConsoleOperatorAssignments.createdAt,
          id: moduleConsoleOperatorAssignments.id,
          operatorUserId: moduleConsoleOperatorAssignments.operatorUserId,
          reason: moduleConsoleOperatorAssignments.reason,
          revokedAt: moduleConsoleOperatorAssignments.revokedAt,
          tenantId: moduleConsoleOperatorAssignments.tenantId,
          validFrom: moduleConsoleOperatorAssignments.validFrom,
          validTo: moduleConsoleOperatorAssignments.validTo,
        })
        .from(moduleConsoleOperatorAssignments)
        .where(and(...conditions)),
    {
      operation: "select",
      resource: "module_console_operator_assignments",
      metadata: {
        companyId: query.companyId,
        consoleId: query.consoleId,
        tenantId: context.tenantId,
      },
    }
  );

  return rows.map(mapAssignmentRow);
};

export const listActiveModuleConsoleOperatorAssignmentsForScope = async (
  tenantId: string,
  query: {
    companyId?: string;
    consoleId?: string;
  } = {}
): Promise<ModuleConsoleOperatorAssignment[]> => {
  if (!isDatabaseRepositoryModeConfigured()) {
    return listActiveAssignmentsFromStore(
      tenantId,
      query.consoleId,
      query.companyId
    );
  }

  const conditions = [
    eq(moduleConsoleOperatorAssignments.tenantId, tenantId),
    isNull(moduleConsoleOperatorAssignments.revokedAt),
  ];

  if (query.consoleId) {
    conditions.push(
      eq(moduleConsoleOperatorAssignments.consoleId, query.consoleId)
    );
  }

  if (query.companyId) {
    conditions.push(
      eq(moduleConsoleOperatorAssignments.companyId, query.companyId)
    );
  }

  const rows = await timeDatabaseQuery(
    () =>
      database
        .select({
          assignedBy: moduleConsoleOperatorAssignments.assignedBy,
          capabilities: moduleConsoleOperatorAssignments.capabilities,
          companyId: moduleConsoleOperatorAssignments.companyId,
          consoleId: moduleConsoleOperatorAssignments.consoleId,
          createdAt: moduleConsoleOperatorAssignments.createdAt,
          id: moduleConsoleOperatorAssignments.id,
          operatorUserId: moduleConsoleOperatorAssignments.operatorUserId,
          reason: moduleConsoleOperatorAssignments.reason,
          revokedAt: moduleConsoleOperatorAssignments.revokedAt,
          tenantId: moduleConsoleOperatorAssignments.tenantId,
          validFrom: moduleConsoleOperatorAssignments.validFrom,
          validTo: moduleConsoleOperatorAssignments.validTo,
        })
        .from(moduleConsoleOperatorAssignments)
        .where(and(...conditions)),
    {
      operation: "select",
      resource: "module_console_operator_assignments",
      metadata: {
        companyId: query.companyId,
        consoleId: query.consoleId,
        tenantId,
      },
    }
  );

  return rows.map(mapAssignmentRow);
};

export const assignModuleConsoleOperator = async (
  input: AssignModuleConsoleOperatorInput,
  context: SystemAdminScope
): Promise<ModuleConsoleOperatorAssignment> => {
  requireModuleConsoleAssignPermission(context);

  if (
    isDatabaseRepositoryModeConfigured() &&
    !(await validateCompanyInTenant(context.tenantId, input.companyId))
  ) {
    throw new Error("Module console operator company scope is not trusted");
  }

  const capabilities =
    input.capabilities && input.capabilities.length > 0
      ? [...input.capabilities]
      : resolveDefaultModuleConsoleOperatorCapabilities(input.consoleId);
  const createdAt = new Date().toISOString();
  const assignmentId = randomUUID();

  if (!isDatabaseRepositoryModeConfigured()) {
    const store = readStoreFromDisk();
    const assignment: ModuleConsoleOperatorAssignment = {
      assignedBy: context.userId,
      capabilities,
      companyId: input.companyId,
      consoleId: input.consoleId,
      createdAt,
      id: assignmentId,
      operatorUserId: input.operatorUserId,
      reason: input.reason,
      tenantId: context.tenantId,
      ...(input.validFrom ? { validFrom: input.validFrom } : {}),
      ...(input.validTo ? { validTo: input.validTo } : {}),
    };

    store.assignments.push(assignment);
    writeStoreToDisk(store);

    return assignment;
  }

  const [assignment] = await timeDatabaseQuery(
    () =>
      database
        .insert(moduleConsoleOperatorAssignments)
        .values({
          assignedBy: context.userId,
          capabilities,
          companyId: input.companyId,
          consoleId: input.consoleId,
          operatorUserId: input.operatorUserId,
          reason: input.reason,
          tenantId: context.tenantId,
          validFrom: input.validFrom ? new Date(input.validFrom) : null,
          validTo: input.validTo ? new Date(input.validTo) : null,
        })
        .returning({
          assignedBy: moduleConsoleOperatorAssignments.assignedBy,
          capabilities: moduleConsoleOperatorAssignments.capabilities,
          companyId: moduleConsoleOperatorAssignments.companyId,
          consoleId: moduleConsoleOperatorAssignments.consoleId,
          createdAt: moduleConsoleOperatorAssignments.createdAt,
          id: moduleConsoleOperatorAssignments.id,
          operatorUserId: moduleConsoleOperatorAssignments.operatorUserId,
          reason: moduleConsoleOperatorAssignments.reason,
          revokedAt: moduleConsoleOperatorAssignments.revokedAt,
          tenantId: moduleConsoleOperatorAssignments.tenantId,
          validFrom: moduleConsoleOperatorAssignments.validFrom,
          validTo: moduleConsoleOperatorAssignments.validTo,
        }),
    {
      operation: "insert",
      resource: "module_console_operator_assignments",
      metadata: {
        consoleId: input.consoleId,
        companyId: input.companyId,
        tenantId: context.tenantId,
      },
    }
  );

  if (!assignment) {
    throw new Error("Failed to assign module console operator");
  }

  return mapAssignmentRow(assignment);
};

export const revokeModuleConsoleOperator = async (
  input: RevokeModuleConsoleOperatorInput,
  context: SystemAdminScope
): Promise<ModuleConsoleOperatorAssignment> => {
  requireModuleConsoleAssignPermission(context);

  const revokedAt = new Date().toISOString();

  if (!isDatabaseRepositoryModeConfigured()) {
    const store = readStoreFromDisk();
    const assignment = store.assignments.find(
      (entry) =>
        entry.id === input.assignmentId &&
        entry.tenantId === context.tenantId &&
        !entry.revokedAt
    );

    if (!assignment) {
      throw new Error("Module console operator assignment not found");
    }

    const revokedAssignment: ModuleConsoleOperatorAssignment = {
      ...assignment,
      revokedAt,
    };
    store.assignments = store.assignments.map((entry) =>
      entry.id === assignment.id ? revokedAssignment : entry
    );
    writeStoreToDisk(store);

    return revokedAssignment;
  }

  const [assignment] = await timeDatabaseQuery(
    () =>
      database
        .update(moduleConsoleOperatorAssignments)
        .set({
          revokedAt: new Date(revokedAt),
        })
        .where(
          and(
            eq(moduleConsoleOperatorAssignments.id, input.assignmentId),
            eq(moduleConsoleOperatorAssignments.tenantId, context.tenantId),
            isNull(moduleConsoleOperatorAssignments.revokedAt)
          )
        )
        .returning({
          assignedBy: moduleConsoleOperatorAssignments.assignedBy,
          capabilities: moduleConsoleOperatorAssignments.capabilities,
          companyId: moduleConsoleOperatorAssignments.companyId,
          consoleId: moduleConsoleOperatorAssignments.consoleId,
          createdAt: moduleConsoleOperatorAssignments.createdAt,
          id: moduleConsoleOperatorAssignments.id,
          operatorUserId: moduleConsoleOperatorAssignments.operatorUserId,
          reason: moduleConsoleOperatorAssignments.reason,
          revokedAt: moduleConsoleOperatorAssignments.revokedAt,
          tenantId: moduleConsoleOperatorAssignments.tenantId,
          validFrom: moduleConsoleOperatorAssignments.validFrom,
          validTo: moduleConsoleOperatorAssignments.validTo,
        }),
    {
      operation: "update",
      resource: "module_console_operator_assignments",
      metadata: {
        assignmentId: input.assignmentId,
        tenantId: context.tenantId,
      },
    }
  );

  if (!assignment) {
    throw new Error("Module console operator assignment not found");
  }

  return mapAssignmentRow(assignment);
};

export const hasActiveModuleConsoleOperator = (
  assignments: readonly ModuleConsoleOperatorAssignment[],
  consoleId: string,
  companyId: string
): boolean =>
  assignments.some(
    (assignment) =>
      assignment.consoleId === consoleId &&
      assignment.companyId === companyId &&
      !assignment.revokedAt
  );

export const resolveModuleConsoleOperatorAssignmentsForActor = (
  assignments: readonly ModuleConsoleOperatorAssignment[],
  actorId: string,
  consoleId: string,
  companyId: string
): ModuleConsoleOperatorAssignment[] =>
  assignments.filter(
    (assignment) =>
      assignment.operatorUserId === actorId &&
      assignment.consoleId === consoleId &&
      assignment.companyId === companyId &&
      !assignment.revokedAt
  );
