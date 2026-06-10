import { pathToFileURL } from "node:url";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { loadDatabaseKeys } from "./keys.ts";
import type { Company, Customer, Tenant } from "./schema.ts";
import {
  companies,
  companyGrants,
  customers,
  employeeUserAccounts,
  tenantMemberships,
  tenants,
  webhookEndpoints,
} from "./schema.ts";

type TenantSeed = {
  name: string;
  slug: string;
};

type CompanySeed = {
  code: string;
  countryCode?: string;
  currencyCode?: string;
  description?: string;
  email?: string;
  establishedOn?: Date;
  isGroup?: boolean;
  name: string;
  parentCompanyId?: string;
  phone?: string;
  registrationNumber?: string;
  status?: string;
  taxId?: string;
  website?: string;
};

type CustomerSeed = {
  code: string;
  name: string;
};

type WebhookEndpointSeed = {
  applicationId?: string;
  applicationName?: string;
  companyId?: string;
  endpointId: string;
  eventOwner: string;
  provider: string;
  schemaVersion: string;
  secret: string;
  status?: string;
  tenantId?: string;
};

export type SeedFoundationResult = {
  companyId: string;
  customerId: string;
  tenantId: string;
};

export type SeedDomainResult = {
  companyGrantId: string;
  employeeUserAccountLinkId?: string;
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
const demoEmployeeId = process.env.XFORGE_DEMO_EMPLOYEE_ID?.trim() ?? "emp-demo";
const webhookEndpointsSeedJson =
  process.env.XFORGE_WEBHOOK_ENDPOINTS_JSON?.trim() ?? "";

const seedClient = postgres(loadDatabaseKeys().DATABASE_URL, {
  prepare: false,
});

const seedDatabaseClient = drizzle(seedClient, {
  schema: {
    companies,
    companyGrants,
    customers,
    employeeUserAccounts,
    tenantMemberships,
    tenants,
    webhookEndpoints,
  },
});

const parseWebhookEndpointSeeds = (): WebhookEndpointSeed[] => {
  if (!webhookEndpointsSeedJson) {
    return [];
  }

  const parsed = JSON.parse(webhookEndpointsSeedJson) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("XFORGE_WEBHOOK_ENDPOINTS_JSON must be an array");
  }

  return parsed.map((entry) => {
    if (typeof entry !== "object" || entry === null) {
      throw new Error("Webhook endpoint seed entries must be objects");
    }

    const endpoint = entry as Record<string, unknown>;

    if (
      typeof endpoint.endpointId !== "string" ||
      typeof endpoint.eventOwner !== "string" ||
      typeof endpoint.provider !== "string" ||
      typeof endpoint.schemaVersion !== "string" ||
      typeof endpoint.secret !== "string"
    ) {
      throw new Error("Webhook endpoint seed entry is malformed");
    }

    return {
      ...(typeof endpoint.applicationId === "string"
        ? {
            applicationId: endpoint.applicationId,
          }
        : {}),
      ...(typeof endpoint.applicationName === "string"
        ? {
            applicationName: endpoint.applicationName,
          }
        : {}),
      ...(typeof endpoint.companyId === "string"
        ? {
            companyId: endpoint.companyId,
          }
        : {}),
      ...(typeof endpoint.status === "string"
        ? {
            status: endpoint.status,
          }
        : {}),
      ...(typeof endpoint.tenantId === "string"
        ? {
            tenantId: endpoint.tenantId,
          }
        : {}),
      endpointId: endpoint.endpointId,
      eventOwner: endpoint.eventOwner,
      provider: endpoint.provider,
      schemaVersion: endpoint.schemaVersion,
      secret: endpoint.secret,
    };
  });
};

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
      isGroup: seed.isGroup ?? false,
      status: seed.status?.trim() || "active",
      tenantId,
    })
    .onConflictDoUpdate({
      target: [companies.tenantId, companies.code],
      set: {
        countryCode: seed.countryCode?.trim() || null,
        currencyCode: seed.currencyCode?.trim() || null,
        description: seed.description?.trim() || null,
        email: seed.email?.trim().toLowerCase() || null,
        establishedOn: seed.establishedOn ?? null,
        isGroup: seed.isGroup ?? false,
        name: seed.name,
        parentCompanyId: seed.parentCompanyId?.trim() || null,
        phone: seed.phone?.trim() || null,
        registrationNumber: seed.registrationNumber?.trim() || null,
        status: seed.status?.trim() || "active",
        taxId: seed.taxId?.trim() || null,
        updatedAt: new Date(),
        website: seed.website?.trim() || null,
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

const upsertEmployeeUserAccountLink = async (
  tenantId: string,
  companyId: string,
  userId: string,
  employeeId: string
): Promise<{ id: string }> => {
  const [link] = await seedDatabaseClient
    .insert(employeeUserAccounts)
    .values({
      active: true,
      companyId,
      employeeId,
      tenantId,
      updatedAt: new Date(),
      userId,
    })
    .onConflictDoUpdate({
      target: [
        employeeUserAccounts.tenantId,
        employeeUserAccounts.companyId,
        employeeUserAccounts.userId,
      ],
      set: {
        active: true,
        employeeId,
        updatedAt: new Date(),
      },
    })
    .returning({
      id: employeeUserAccounts.id,
    });

  if (!link) {
    throw new Error("failed to seed employee user account link");
  }

  return link;
};

export const seedWebhookEndpoints = async (
  foundation: SeedFoundationResult,
  seeds: WebhookEndpointSeed[] = parseWebhookEndpointSeeds()
): Promise<number> => {
  let seeded = 0;

  for (const seed of seeds) {
    await seedDatabaseClient
      .insert(webhookEndpoints)
      .values({
        applicationId: seed.applicationId?.trim() || null,
        applicationName: seed.applicationName?.trim() || null,
        companyId: seed.companyId?.trim() || foundation.companyId,
        endpointId: seed.endpointId.trim(),
        eventOwner: seed.eventOwner.trim(),
        provider: seed.provider.trim(),
        schemaVersion: seed.schemaVersion.trim(),
        secret: seed.secret.trim(),
        status: seed.status?.trim() || "active",
        tenantId: seed.tenantId?.trim() || foundation.tenantId,
      })
      .onConflictDoUpdate({
        target: [webhookEndpoints.provider, webhookEndpoints.endpointId],
        set: {
          applicationId: seed.applicationId?.trim() || null,
          applicationName: seed.applicationName?.trim() || null,
          companyId: seed.companyId?.trim() || foundation.companyId,
          eventOwner: seed.eventOwner.trim(),
          schemaVersion: seed.schemaVersion.trim(),
          secret: seed.secret.trim(),
          status: seed.status?.trim() || "active",
          updatedAt: new Date(),
        },
      });

    seeded += 1;
  }

  return seeded;
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
    const employeeLink = await upsertEmployeeUserAccountLink(
      foundation.tenantId,
      foundation.companyId,
      trimmedUserId,
      demoEmployeeId
    );

    return {
      companyGrantId: grant.id,
      employeeUserAccountLinkId: employeeLink.id,
      tenantMembershipId: membership.id,
      userId: trimmedUserId,
    };
  });
};

export const seedDatabase = async (): Promise<SeedFoundationResult> => {
  const foundation = await seedFoundationDatabase();
  await seedDomainFixtures(foundation, demoUserId);
  await seedWebhookEndpoints(foundation);

  return foundation;
};

const run = async (): Promise<void> => {
  try {
    const foundation = await seedFoundationDatabase();
    const domain = await seedDomainFixtures(foundation, demoUserId);
    const seededWebhookEndpoints = await seedWebhookEndpoints(foundation);

    const messages = [
      "seed complete",
      `tenant=${foundation.tenantId}`,
      `company=${foundation.companyId}`,
      `customer=${foundation.customerId}`,
      `webhookEndpoints=${seededWebhookEndpoints}`,
    ];

    if (domain) {
      messages.push(`user=${domain.userId}`);
      messages.push(`tenantMembership=${domain.tenantMembershipId}`);
      messages.push(`companyGrant=${domain.companyGrantId}`);
      if (domain.employeeUserAccountLinkId) {
        messages.push(
          `employeeUserAccountLink=${domain.employeeUserAccountLinkId}`
        );
        messages.push(`employeeId=${demoEmployeeId}`);
      }
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
