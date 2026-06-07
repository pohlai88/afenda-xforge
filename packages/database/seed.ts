import { pathToFileURL } from "node:url";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { loadDatabaseKeys } from "./keys.ts";
import type { Company, Customer, Tenant } from "./schema.ts";
import {
  companies,
  companyGrants,
  customers,
  tenantMemberships,
  tenants,
} from "./schema.ts";

type TenantSeed = {
  name: string;
  slug: string;
};

type CompanySeed = {
  code: string;
  name: string;
};

type CustomerSeed = {
  code: string;
  name: string;
};

export type SeedFoundationResult = {
  companyId: string;
  customerId: string;
  tenantId: string;
};

export type SeedDomainResult = {
  companyGrantId: string;
  tenantMembershipId: string;
  userId: string;
};

const foundationTenant: TenantSeed = {
  name: "Xforge",
  slug: "xforge",
};

const foundationCompany: CompanySeed = {
  code: "MAIN",
  name: "Xforge Main",
};

const foundationCustomer: CustomerSeed = {
  code: "DEMO",
  name: "Demo Customer",
};

const demoUserId = process.env.XFORGE_DEMO_USER_ID?.trim() ?? "";

const seedClient = postgres(loadDatabaseKeys().DATABASE_URL, {
  prepare: false,
});

const seedDatabaseClient = drizzle(seedClient, {
  schema: {
    companies,
    companyGrants,
    customers,
    tenantMemberships,
    tenants,
  },
});

const upsertTenant = async (seed: TenantSeed): Promise<Tenant> => {
  const [tenant] = await seedDatabaseClient
    .insert(tenants)
    .values(seed)
    .onConflictDoUpdate({
      target: tenants.slug,
      set: {
        name: seed.name,
        updatedAt: new Date(),
      },
    })
    .returning();

  if (!tenant) {
    throw new Error("failed to seed tenant");
  }

  return tenant;
};

const upsertCompany = async (
  tenantId: string,
  seed: CompanySeed
): Promise<Company> => {
  const [company] = await seedDatabaseClient
    .insert(companies)
    .values({
      ...seed,
      tenantId,
    })
    .onConflictDoUpdate({
      target: [companies.tenantId, companies.code],
      set: {
        name: seed.name,
        updatedAt: new Date(),
      },
    })
    .returning();

  if (!company) {
    throw new Error("failed to seed company");
  }

  return company;
};

const upsertCustomer = async (
  tenantId: string,
  seed: CustomerSeed
): Promise<Customer> => {
  const [customer] = await seedDatabaseClient
    .insert(customers)
    .values({
      ...seed,
      tenantId,
    })
    .onConflictDoUpdate({
      target: [customers.tenantId, customers.code],
      set: {
        name: seed.name,
        updatedAt: new Date(),
      },
    })
    .returning();

  if (!customer) {
    throw new Error("failed to seed customer");
  }

  return customer;
};

const upsertTenantMembership = async (
  tenantId: string,
  userId: string
): Promise<{ id: string }> => {
  const [membership] = await seedDatabaseClient
    .insert(tenantMemberships)
    .values({
      role: "owner",
      tenantId,
      userId,
    })
    .onConflictDoUpdate({
      target: [tenantMemberships.tenantId, tenantMemberships.userId],
      set: {
        role: "owner",
        updatedAt: new Date(),
      },
    })
    .returning({
      id: tenantMemberships.id,
    });

  if (!membership) {
    throw new Error("failed to seed tenant membership");
  }

  return membership;
};

const upsertCompanyGrant = async (
  tenantId: string,
  companyId: string,
  userId: string
): Promise<{ id: string }> => {
  const [grant] = await seedDatabaseClient
    .insert(companyGrants)
    .values({
      companyId,
      grant: "owner",
      tenantId,
      userId,
    })
    .onConflictDoUpdate({
      target: [
        companyGrants.tenantId,
        companyGrants.companyId,
        companyGrants.userId,
        companyGrants.grant,
      ],
      set: {
        grant: "owner",
        updatedAt: new Date(),
      },
    })
    .returning({
      id: companyGrants.id,
    });

  if (!grant) {
    throw new Error("failed to seed company grant");
  }

  return grant;
};

export const seedFoundationDatabase = async (): Promise<SeedFoundationResult> =>
  seedDatabaseClient.transaction(async () => {
    const tenant = await upsertTenant(foundationTenant);
    const company = await upsertCompany(tenant.id, foundationCompany);
    const customer = await upsertCustomer(tenant.id, foundationCustomer);

    return {
      companyId: company.id,
      customerId: customer.id,
      tenantId: tenant.id,
    };
  });

export const seedDomainFixtures = (
  foundation: SeedFoundationResult,
  userId: string
): Promise<SeedDomainResult | null> => {
  const trimmedUserId = userId.trim();

  if (!trimmedUserId) {
    return Promise.resolve(null);
  }

  return seedDatabaseClient.transaction(async () => {
    const membership = await upsertTenantMembership(
      foundation.tenantId,
      trimmedUserId
    );
    const grant = await upsertCompanyGrant(
      foundation.tenantId,
      foundation.companyId,
      trimmedUserId
    );

    return {
      companyGrantId: grant.id,
      tenantMembershipId: membership.id,
      userId: trimmedUserId,
    };
  });
};

export const seedDatabase = async (): Promise<SeedFoundationResult> => {
  const foundation = await seedFoundationDatabase();
  await seedDomainFixtures(foundation, demoUserId);

  return foundation;
};

const run = async (): Promise<void> => {
  try {
    const foundation = await seedFoundationDatabase();
    const domain = await seedDomainFixtures(foundation, demoUserId);

    const messages = [
      "seed complete",
      `tenant=${foundation.tenantId}`,
      `company=${foundation.companyId}`,
      `customer=${foundation.customerId}`,
    ];

    if (domain) {
      messages.push(`user=${domain.userId}`);
      messages.push(`tenantMembership=${domain.tenantMembershipId}`);
      messages.push(`companyGrant=${domain.companyGrantId}`);
    } else {
      messages.push(
        "domain fixtures skipped (set XFORGE_DEMO_USER_ID to enable)"
      );
    }

    console.log(messages.join(" | "));
  } finally {
    await seedClient.end({ timeout: 0 });
  }
};

const isMain =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  run().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
