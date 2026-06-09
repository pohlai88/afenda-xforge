import "server-only";

import {
  companies,
  companyGrants,
  database,
  tenantMemberships,
  timeDatabaseQuery,
} from "@repo/database";
import { ForbiddenError } from "@repo/errors";
import { and, asc, eq } from "drizzle-orm";

export type ExplicitTenantMembership = {
  id: string;
  role: string;
  tenantId: string;
  userId: string;
};

export type ExplicitTenantAccess = {
  membership: ExplicitTenantMembership;
};

export type ExplicitCompanyGrant = {
  companyCode: string;
  companyId: string;
  companyName: string;
  grant: string;
  grantId: string;
  tenantId: string;
  userId: string;
};

export type ExplicitCompanyAccess = ExplicitTenantAccess & {
  company: ExplicitCompanyGrant;
};

const findTenantMembership = async ({
  tenantId,
  userId,
}: {
  tenantId: string;
  userId: string;
}): Promise<ExplicitTenantMembership | null> => {
  const [membership] = await timeDatabaseQuery(
    () =>
      database
        .select({
          id: tenantMemberships.id,
          role: tenantMemberships.role,
          tenantId: tenantMemberships.tenantId,
          userId: tenantMemberships.userId,
        })
        .from(tenantMemberships)
        .where(
          and(
            eq(tenantMemberships.tenantId, tenantId),
            eq(tenantMemberships.userId, userId)
          )
        )
        .limit(1),
    {
      operation: "select",
      resource: "tenant_memberships",
      metadata: {
        tenantId,
        userId,
      },
    }
  );

  return membership ?? null;
};

const findCompanyGrant = async ({
  companyId,
  tenantId,
  userId,
}: {
  companyId: string;
  tenantId: string;
  userId: string;
}): Promise<ExplicitCompanyGrant | null> => {
  const [grant] = await timeDatabaseQuery(
    () =>
      database
        .select({
          companyCode: companies.code,
          companyId: companyGrants.companyId,
          companyName: companies.name,
          grant: companyGrants.grant,
          grantId: companyGrants.id,
          tenantId: companyGrants.tenantId,
          userId: companyGrants.userId,
        })
        .from(companyGrants)
        .innerJoin(companies, eq(companies.id, companyGrants.companyId))
        .where(
          and(
            eq(companyGrants.tenantId, tenantId),
            eq(companyGrants.userId, userId),
            eq(companyGrants.companyId, companyId)
          )
        )
        .orderBy(asc(companies.name), asc(companyGrants.createdAt))
        .limit(1),
    {
      operation: "select",
      resource: "company_grants",
      metadata: {
        companyId,
        tenantId,
        userId,
      },
    }
  );

  return grant ?? null;
};

export const requireTenantActorAccess = async ({
  tenantId,
  userId,
}: {
  tenantId: string;
  userId: string;
}): Promise<ExplicitTenantAccess> => {
  const membership = await findTenantMembership({ tenantId, userId });

  if (!membership) {
    throw new ForbiddenError(
      "Tenant membership is required for this operation"
    );
  }

  return { membership };
};

export const requireCompanyActorAccess = async ({
  companyId,
  tenantId,
  userId,
}: {
  companyId: string;
  tenantId: string;
  userId: string;
}): Promise<ExplicitCompanyAccess> => {
  const access = await requireTenantActorAccess({ tenantId, userId });
  const company = await findCompanyGrant({ companyId, tenantId, userId });

  if (!company) {
    throw new ForbiddenError("A company grant is required for this operation");
  }

  return {
    ...access,
    company,
  };
};
