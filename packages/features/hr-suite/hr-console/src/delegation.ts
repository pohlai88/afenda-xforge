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
import { database, hrDelegationGrants, timeDatabaseQuery } from "@repo/database";
import { and, eq, isNull } from "drizzle-orm";
import type { HrDelegationGrant, HrDelegationGrantSnapshot } from "./schema.ts";

const repositoryFilePath = resolve(
  process.cwd(),
  ".data/hr-delegation-grants.json"
);

type DelegationStore = {
  grants: HrDelegationGrant[];
};

const isDatabaseRepositoryModeConfigured = (): boolean =>
  process.env.AFENDA_HR_CONSOLE_REPOSITORY_MODE !== "file" &&
  Boolean(process.env.DATABASE_URL);

const emptyStore = (): DelegationStore => ({
  grants: [],
});

const ensureRepositoryDirectory = (): void => {
  mkdirSync(dirname(repositoryFilePath), { recursive: true });
};

const readStoreFromDisk = (): DelegationStore => {
  if (!existsSync(repositoryFilePath)) {
    return emptyStore();
  }

  const parsed = JSON.parse(
    readFileSync(repositoryFilePath, "utf8")
  ) as DelegationStore;

  return {
    grants: parsed.grants ?? [],
  };
};

const writeStoreToDisk = (store: DelegationStore): void => {
  ensureRepositoryDirectory();
  const tempPath = `${repositoryFilePath}.${randomUUID()}.tmp`;
  writeFileSync(tempPath, JSON.stringify(store, null, 2), "utf8");
  renameSync(tempPath, repositoryFilePath);
};

const mapGrantRow = (row: {
  capabilities: string[];
  companyId: string;
  createdAt: Date;
  granteeId: string;
  grantorId: string;
  id: string;
  reason: string | null;
  revokedAt: Date | null;
  tenantId: string;
  validFrom: Date | null;
  validTo: Date | null;
}): HrDelegationGrant => ({
  capabilities: row.capabilities,
  companyId: row.companyId,
  createdAt: row.createdAt.toISOString(),
  granteeId: row.granteeId,
  grantorId: row.grantorId,
  id: row.id,
  ...(row.reason ? { reason: row.reason } : {}),
  ...(row.revokedAt ? { revokedAt: row.revokedAt.toISOString() } : {}),
  tenantId: row.tenantId,
  ...(row.validFrom ? { validFrom: row.validFrom.toISOString() } : {}),
  ...(row.validTo ? { validTo: row.validTo.toISOString() } : {}),
});

export const listHrDelegationGrants = async (
  tenantId: string,
  companyId: string
): Promise<HrDelegationGrant[]> => {
  if (!isDatabaseRepositoryModeConfigured()) {
    return readStoreFromDisk().grants.filter(
      (grant) =>
        grant.tenantId === tenantId &&
        grant.companyId === companyId &&
        !grant.revokedAt
    );
  }

  const rows = await timeDatabaseQuery(
    () =>
      database
        .select({
          capabilities: hrDelegationGrants.capabilities,
          companyId: hrDelegationGrants.companyId,
          createdAt: hrDelegationGrants.createdAt,
          granteeId: hrDelegationGrants.granteeId,
          grantorId: hrDelegationGrants.grantorId,
          id: hrDelegationGrants.id,
          reason: hrDelegationGrants.reason,
          revokedAt: hrDelegationGrants.revokedAt,
          tenantId: hrDelegationGrants.tenantId,
          validFrom: hrDelegationGrants.validFrom,
          validTo: hrDelegationGrants.validTo,
        })
        .from(hrDelegationGrants)
        .where(
          and(
            eq(hrDelegationGrants.tenantId, tenantId),
            eq(hrDelegationGrants.companyId, companyId),
            isNull(hrDelegationGrants.revokedAt)
          )
        ),
    {
      operation: "select",
      resource: "hr_delegation_grants",
      metadata: {
        companyId,
        tenantId,
      },
    }
  );

  return rows.map(mapGrantRow);
};

export const listHrDelegationGrantSnapshots = async (
  tenantId: string,
  companyId: string
): Promise<HrDelegationGrantSnapshot[]> =>
  (await listHrDelegationGrants(tenantId, companyId)).map((grant) => ({
    capabilities: grant.capabilities,
    companyId: grant.companyId,
    granteeId: grant.granteeId,
    grantorId: grant.grantorId,
    ...(grant.revokedAt ? { revokedAt: grant.revokedAt } : {}),
    ...(grant.validFrom ? { validFrom: grant.validFrom } : {}),
    ...(grant.validTo ? { validTo: grant.validTo } : {}),
  }));

export const grantHrDelegation = async (input: {
  capabilities: readonly string[];
  companyId: string;
  granteeId: string;
  grantorId: string;
  reason: string;
  tenantId: string;
  validFrom?: string;
  validTo?: string;
}): Promise<HrDelegationGrant> => {
  const createdAt = new Date().toISOString();
  const grantId = randomUUID();

  if (!isDatabaseRepositoryModeConfigured()) {
    const store = readStoreFromDisk();
    const grant: HrDelegationGrant = {
      capabilities: [...input.capabilities],
      companyId: input.companyId,
      createdAt,
      granteeId: input.granteeId,
      grantorId: input.grantorId,
      id: grantId,
      reason: input.reason,
      tenantId: input.tenantId,
      ...(input.validFrom ? { validFrom: input.validFrom } : {}),
      ...(input.validTo ? { validTo: input.validTo } : {}),
    };

    store.grants.push(grant);
    writeStoreToDisk(store);

    return grant;
  }

  const [grant] = await timeDatabaseQuery(
    () =>
      database
        .insert(hrDelegationGrants)
        .values({
          capabilities: [...input.capabilities],
          companyId: input.companyId,
          granteeId: input.granteeId,
          grantorId: input.grantorId,
          reason: input.reason,
          tenantId: input.tenantId,
          validFrom: input.validFrom ? new Date(input.validFrom) : null,
          validTo: input.validTo ? new Date(input.validTo) : null,
        })
        .returning({
          capabilities: hrDelegationGrants.capabilities,
          companyId: hrDelegationGrants.companyId,
          createdAt: hrDelegationGrants.createdAt,
          granteeId: hrDelegationGrants.granteeId,
          grantorId: hrDelegationGrants.grantorId,
          id: hrDelegationGrants.id,
          reason: hrDelegationGrants.reason,
          revokedAt: hrDelegationGrants.revokedAt,
          tenantId: hrDelegationGrants.tenantId,
          validFrom: hrDelegationGrants.validFrom,
          validTo: hrDelegationGrants.validTo,
        }),
    {
      operation: "insert",
      resource: "hr_delegation_grants",
      metadata: {
        companyId: input.companyId,
        tenantId: input.tenantId,
      },
    }
  );

  if (!grant) {
    throw new Error("Failed to grant HR delegation");
  }

  const mappedGrant = mapGrantRow(grant);

  return mappedGrant;
};

export const revokeHrDelegation = async (input: {
  companyId: string;
  grantId: string;
  grantorId: string;
  reason: string;
  tenantId: string;
}): Promise<HrDelegationGrant> => {
  const revokedAt = new Date().toISOString();

  if (!isDatabaseRepositoryModeConfigured()) {
    const store = readStoreFromDisk();
    const grant = store.grants.find(
      (entry) =>
        entry.id === input.grantId &&
        entry.tenantId === input.tenantId &&
        entry.companyId === input.companyId &&
        !entry.revokedAt
    );

    if (!grant) {
      throw new Error("HR delegation grant not found");
    }

    const revokedGrant: HrDelegationGrant = {
      ...grant,
      revokedAt,
    };
    store.grants = store.grants.map((entry) =>
      entry.id === grant.id ? revokedGrant : entry
    );
    writeStoreToDisk(store);

    return revokedGrant;
  }

  const [grant] = await timeDatabaseQuery(
    () =>
      database
        .update(hrDelegationGrants)
        .set({
          revokedAt: new Date(revokedAt),
        })
        .where(
          and(
            eq(hrDelegationGrants.id, input.grantId),
            eq(hrDelegationGrants.tenantId, input.tenantId),
            eq(hrDelegationGrants.companyId, input.companyId),
            isNull(hrDelegationGrants.revokedAt)
          )
        )
        .returning({
          capabilities: hrDelegationGrants.capabilities,
          companyId: hrDelegationGrants.companyId,
          createdAt: hrDelegationGrants.createdAt,
          granteeId: hrDelegationGrants.granteeId,
          grantorId: hrDelegationGrants.grantorId,
          id: hrDelegationGrants.id,
          reason: hrDelegationGrants.reason,
          revokedAt: hrDelegationGrants.revokedAt,
          tenantId: hrDelegationGrants.tenantId,
          validFrom: hrDelegationGrants.validFrom,
          validTo: hrDelegationGrants.validTo,
        }),
    {
      operation: "update",
      resource: "hr_delegation_grants",
      metadata: {
        grantId: input.grantId,
        tenantId: input.tenantId,
      },
    }
  );

  if (!grant) {
    throw new Error("HR delegation grant not found");
  }

  return mapGrantRow(grant);
};
