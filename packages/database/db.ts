import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { loadDatabaseKeys } from "./keys.js";
import {
  companies,
  companiesRelations,
  companyGrants,
  companyGrantsRelations,
  tenantMemberships,
  tenantMembershipsRelations,
  tenants,
  tenantsRelations,
  xforge,
} from "./schema.js";

const connectionString: string = loadDatabaseKeys().DATABASE_URL;
const schema: typeof import("./schema.js") = {
  xforge,
  companyGrants,
  companyGrantsRelations,
  companies,
  companiesRelations,
  tenantMemberships,
  tenantMembershipsRelations,
  tenants,
  tenantsRelations,
};

// Supabase's shared pooler requires prepared statements to be disabled.
export const client = postgres(connectionString, { prepare: false });

export const database = drizzle(client, {
  schema,
});

export * from "./schema.js";
