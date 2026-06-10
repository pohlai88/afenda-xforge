import "server-only";

import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { and, eq } from "drizzle-orm";
import type {
  EmployeeUserAccountLinkRecord,
  ListEmployeeUserAccountLinksQuery,
  UpsertEmployeeUserAccountLinkInput,
} from "./employee-user-link.schema.ts";

type EmployeeUserAccountStore = {
  links: EmployeeUserAccountLinkRecord[];
};

const defaultRepositoryFilePath = resolve(
  process.cwd(),
  ".data/employee-user-accounts.json"
);

let repositoryFilePathOverride: string | undefined;

export const setEmployeeUserAccountRepositoryPathForTesting = (
  path: string
): void => {
  repositoryFilePathOverride = path;
};

export const resetEmployeeUserAccountRepositoryPathForTesting = (): void => {
  repositoryFilePathOverride = undefined;
};

const repositoryFilePath = (): string =>
  repositoryFilePathOverride ?? defaultRepositoryFilePath;

export const isEmployeeUserAccountDatabaseModeConfigured = (): boolean =>
  process.env.AFENDA_EMPLOYEE_RECORDS_REPOSITORY_MODE !== "file" &&
  Boolean(process.env.DATABASE_URL);

const emptyStore = (): EmployeeUserAccountStore => ({
  links: [],
});

const ensureRepositoryDirectory = (): void => {
  mkdirSync(dirname(repositoryFilePath()), { recursive: true });
};

const readStoreFromDisk = (): EmployeeUserAccountStore => {
  const filePath = repositoryFilePath();
  if (!existsSync(filePath)) {
    return emptyStore();
  }

  const parsed = JSON.parse(
    readFileSync(filePath, "utf8")
  ) as EmployeeUserAccountStore;

  return {
    links: parsed.links ?? [],
  };
};

const writeStoreToDisk = (store: EmployeeUserAccountStore): void => {
  ensureRepositoryDirectory();
  const filePath = repositoryFilePath();
  const tempPath = `${filePath}.${randomUUID()}.tmp`;
  writeFileSync(tempPath, JSON.stringify(store, null, 2), "utf8");
  try {
    renameSync(tempPath, filePath);
  } catch (error) {
    writeFileSync(filePath, JSON.stringify(store, null, 2), "utf8");
    try {
      rmSync(tempPath, { force: true });
    } catch {
      // Best-effort temp cleanup after direct write fallback.
    }
    if (error instanceof Error && !error.message.includes("EPERM")) {
      throw error;
    }
  }
};

export const resetEmployeeUserAccountLinksForTests = (): void => {
  writeStoreToDisk(emptyStore());
};

export const seedEmployeeUserAccountLinkForTests = (input: {
  active?: boolean;
  companyId: string;
  employeeId: string;
  tenantId: string;
  userId: string;
}): EmployeeUserAccountLinkRecord => {
  const now = new Date().toISOString();
  const link = upsertEmployeeUserAccountLinkInFileStore(
    {
      active: input.active ?? true,
      employeeId: input.employeeId,
      userId: input.userId,
    },
    {
      companyId: input.companyId,
      tenantId: input.tenantId,
    }
  );

  return link;
};

const mapDatabaseRow = (row: {
  active: boolean;
  companyId: string;
  createdAt: Date;
  employeeId: string;
  id: string;
  tenantId: string;
  updatedAt: Date;
  userId: string;
}): EmployeeUserAccountLinkRecord => ({
  active: row.active,
  companyId: row.companyId,
  createdAt: row.createdAt.toISOString(),
  employeeId: row.employeeId,
  id: row.id,
  tenantId: row.tenantId,
  updatedAt: row.updatedAt.toISOString(),
  userId: row.userId,
});

const upsertEmployeeUserAccountLinkInFileStore = (
  input: UpsertEmployeeUserAccountLinkInput,
  scope: { companyId: string; tenantId: string }
): EmployeeUserAccountLinkRecord => {
  const store = readStoreFromDisk();
  const now = new Date().toISOString();
  const active = input.active ?? true;

  const employeeConflict = store.links.find(
    (entry) =>
      entry.tenantId === scope.tenantId &&
      entry.companyId === scope.companyId &&
      entry.employeeId === input.employeeId &&
      entry.userId !== input.userId &&
      entry.active
  );
  if (employeeConflict) {
    throw new Error(
      "Employee is already linked to a different auth user for this company"
    );
  }

  const existingByUser = store.links.find(
    (entry) =>
      entry.tenantId === scope.tenantId &&
      entry.companyId === scope.companyId &&
      entry.userId === input.userId
  );

  if (existingByUser) {
    const updated: EmployeeUserAccountLinkRecord = {
      ...existingByUser,
      active,
      employeeId: input.employeeId,
      updatedAt: now,
    };
    store.links = store.links.map((entry) =>
      entry.id === existingByUser.id ? updated : entry
    );
    writeStoreToDisk(store);
    return updated;
  }

  const created: EmployeeUserAccountLinkRecord = {
    active,
    companyId: scope.companyId,
    createdAt: now,
    employeeId: input.employeeId,
    id: randomUUID(),
    tenantId: scope.tenantId,
    updatedAt: now,
    userId: input.userId,
  };
  store.links.push(created);
  writeStoreToDisk(store);
  return created;
};

const upsertEmployeeUserAccountLinkInDatabase = async (
  input: UpsertEmployeeUserAccountLinkInput,
  scope: { companyId: string; tenantId: string }
): Promise<EmployeeUserAccountLinkRecord> => {
  const { database, employeeUserAccounts, timeDatabaseQuery } = await import(
    "@repo/database"
  );
  const active = input.active ?? true;
  const now = new Date();

  const employeeConflict = await timeDatabaseQuery(
    () =>
      database
        .select({ userId: employeeUserAccounts.userId })
        .from(employeeUserAccounts)
        .where(
          and(
            eq(employeeUserAccounts.tenantId, scope.tenantId),
            eq(employeeUserAccounts.companyId, scope.companyId),
            eq(employeeUserAccounts.employeeId, input.employeeId),
            eq(employeeUserAccounts.active, true)
          )
        )
        .limit(1),
    {
      metadata: scope,
      operation: "select",
      resource: "employee_user_accounts",
    }
  );

  if (
    employeeConflict[0]?.userId &&
    employeeConflict[0].userId !== input.userId
  ) {
    throw new Error(
      "Employee is already linked to a different auth user for this company"
    );
  }

  const [row] = await timeDatabaseQuery(
    () =>
      database
        .insert(employeeUserAccounts)
        .values({
          active,
          companyId: scope.companyId,
          employeeId: input.employeeId,
          tenantId: scope.tenantId,
          updatedAt: now,
          userId: input.userId,
        })
        .onConflictDoUpdate({
          target: [
            employeeUserAccounts.tenantId,
            employeeUserAccounts.companyId,
            employeeUserAccounts.userId,
          ],
          set: {
            active,
            employeeId: input.employeeId,
            updatedAt: now,
          },
        })
        .returning({
          active: employeeUserAccounts.active,
          companyId: employeeUserAccounts.companyId,
          createdAt: employeeUserAccounts.createdAt,
          employeeId: employeeUserAccounts.employeeId,
          id: employeeUserAccounts.id,
          tenantId: employeeUserAccounts.tenantId,
          updatedAt: employeeUserAccounts.updatedAt,
          userId: employeeUserAccounts.userId,
        }),
    {
      metadata: {
        ...scope,
        userId: input.userId,
      },
      operation: "upsert",
      resource: "employee_user_accounts",
    }
  );

  if (!row) {
    throw new Error("Failed to upsert employee user account link");
  }

  return mapDatabaseRow(row);
};

export const upsertEmployeeUserAccountLinkRecord = async (
  input: UpsertEmployeeUserAccountLinkInput,
  scope: { companyId: string; tenantId: string }
): Promise<EmployeeUserAccountLinkRecord> => {
  if (isEmployeeUserAccountDatabaseModeConfigured()) {
    return upsertEmployeeUserAccountLinkInDatabase(input, scope);
  }

  return upsertEmployeeUserAccountLinkInFileStore(input, scope);
};

const listEmployeeUserAccountLinksFromFileStore = (
  scope: { companyId: string; tenantId: string },
  query: ListEmployeeUserAccountLinksQuery
): EmployeeUserAccountLinkRecord[] =>
  readStoreFromDisk().links.filter((entry) => {
    if (
      entry.tenantId !== scope.tenantId ||
      entry.companyId !== scope.companyId
    ) {
      return false;
    }

    if (query.userId && entry.userId !== query.userId) {
      return false;
    }

    if (query.employeeId && entry.employeeId !== query.employeeId) {
      return false;
    }

    return true;
  });

const listEmployeeUserAccountLinksFromDatabase = async (
  scope: { companyId: string; tenantId: string },
  query: ListEmployeeUserAccountLinksQuery
): Promise<EmployeeUserAccountLinkRecord[]> => {
  const { database, employeeUserAccounts, timeDatabaseQuery } = await import(
    "@repo/database"
  );

  const conditions = [
    eq(employeeUserAccounts.tenantId, scope.tenantId),
    eq(employeeUserAccounts.companyId, scope.companyId),
  ];

  if (query.userId) {
    conditions.push(eq(employeeUserAccounts.userId, query.userId));
  }

  if (query.employeeId) {
    conditions.push(eq(employeeUserAccounts.employeeId, query.employeeId));
  }

  const rows = await timeDatabaseQuery(
    () =>
      database
        .select({
          active: employeeUserAccounts.active,
          companyId: employeeUserAccounts.companyId,
          createdAt: employeeUserAccounts.createdAt,
          employeeId: employeeUserAccounts.employeeId,
          id: employeeUserAccounts.id,
          tenantId: employeeUserAccounts.tenantId,
          updatedAt: employeeUserAccounts.updatedAt,
          userId: employeeUserAccounts.userId,
        })
        .from(employeeUserAccounts)
        .where(and(...conditions)),
    {
      metadata: {
        ...scope,
        ...query,
      },
      operation: "select",
      resource: "employee_user_accounts",
    }
  );

  return rows.map(mapDatabaseRow);
};

export const listEmployeeUserAccountLinkRecords = async (
  scope: { companyId: string; tenantId: string },
  query: ListEmployeeUserAccountLinksQuery = {}
): Promise<EmployeeUserAccountLinkRecord[]> => {
  if (isEmployeeUserAccountDatabaseModeConfigured()) {
    return listEmployeeUserAccountLinksFromDatabase(scope, query);
  }

  return listEmployeeUserAccountLinksFromFileStore(scope, query);
};

const resolveEmployeeIdFromFileStore = (args: {
  companyId: string;
  tenantId: string;
  userId: string;
}): string | undefined => {
  const match = readStoreFromDisk().links.find(
    (entry) =>
      entry.tenantId === args.tenantId &&
      entry.companyId === args.companyId &&
      entry.userId === args.userId &&
      entry.active
  );

  return match?.employeeId;
};

const resolveEmployeeIdFromDatabase = async (args: {
  companyId: string;
  tenantId: string;
  userId: string;
}): Promise<string | undefined> => {
  const { database, employeeUserAccounts, timeDatabaseQuery } = await import(
    "@repo/database"
  );

  const rows = await timeDatabaseQuery(
    () =>
      database
        .select({
          employeeId: employeeUserAccounts.employeeId,
        })
        .from(employeeUserAccounts)
        .where(
          and(
            eq(employeeUserAccounts.tenantId, args.tenantId),
            eq(employeeUserAccounts.companyId, args.companyId),
            eq(employeeUserAccounts.userId, args.userId),
            eq(employeeUserAccounts.active, true)
          )
        )
        .limit(1),
    {
      metadata: args,
      operation: "select",
      resource: "employee_user_accounts",
    }
  );

  return rows[0]?.employeeId;
};

export const resolveEmployeeIdByAuthUserIdFromStore = async (args: {
  companyId: string;
  tenantId: string;
  userId: string;
}): Promise<string | undefined> => {
  if (isEmployeeUserAccountDatabaseModeConfigured()) {
    return resolveEmployeeIdFromDatabase(args);
  }

  return resolveEmployeeIdFromFileStore(args);
};

const resolveAuthUserIdFromFileStore = (args: {
  companyId: string;
  employeeId: string;
  tenantId: string;
}): string | undefined => {
  const match = readStoreFromDisk().links.find(
    (entry) =>
      entry.tenantId === args.tenantId &&
      entry.companyId === args.companyId &&
      entry.employeeId === args.employeeId &&
      entry.active
  );

  return match?.userId;
};

const resolveAuthUserIdFromDatabase = async (args: {
  companyId: string;
  employeeId: string;
  tenantId: string;
}): Promise<string | undefined> => {
  const { database, employeeUserAccounts, timeDatabaseQuery } = await import(
    "@repo/database"
  );

  const rows = await timeDatabaseQuery(
    () =>
      database
        .select({
          userId: employeeUserAccounts.userId,
        })
        .from(employeeUserAccounts)
        .where(
          and(
            eq(employeeUserAccounts.tenantId, args.tenantId),
            eq(employeeUserAccounts.companyId, args.companyId),
            eq(employeeUserAccounts.employeeId, args.employeeId),
            eq(employeeUserAccounts.active, true)
          )
        )
        .limit(1),
    {
      metadata: args,
      operation: "select",
      resource: "employee_user_accounts",
    }
  );

  return rows[0]?.userId;
};

export const resolveAuthUserIdByEmployeeIdFromStore = async (args: {
  companyId: string;
  employeeId: string;
  tenantId: string;
}): Promise<string | undefined> => {
  if (isEmployeeUserAccountDatabaseModeConfigured()) {
    return resolveAuthUserIdFromDatabase(args);
  }

  return resolveAuthUserIdFromFileStore(args);
};
