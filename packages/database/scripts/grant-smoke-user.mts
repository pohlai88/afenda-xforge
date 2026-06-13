import { pathToFileURL } from "node:url";
import postgres from "postgres";
import { loadDatabaseKeys } from "../keys.ts";

const userId = process.argv[2]?.trim();

if (!userId) {
  console.error("usage: grant-smoke-user.mts <user-id>");
  process.exit(1);
}

const sql = postgres(loadDatabaseKeys().DATABASE_URL, { max: 1 });

try {
  const [tenant] = await sql<{ id: string }[]>`
    select id from xforge.tenants order by created_at asc limit 1
  `;

  if (!tenant?.id) {
    throw new Error("missing tenant row");
  }

  const [company] = await sql<{ id: string }[]>`
    select id from xforge.companies
    where tenant_id = ${tenant.id}
    order by created_at asc
    limit 1
  `;

  if (!company?.id) {
    throw new Error("missing company row");
  }

  await sql`
    insert into xforge.tenant_memberships (tenant_id, user_id, role)
    values (${tenant.id}, ${userId}, 'owner')
    on conflict (tenant_id, user_id) do update
    set role = excluded.role, updated_at = now()
  `;

  await sql`
    insert into xforge.company_grants (tenant_id, company_id, user_id, "grant")
    values (${tenant.id}, ${company.id}, ${userId}, 'owner')
    on conflict (tenant_id, company_id, user_id, "grant") do update
    set "grant" = excluded."grant", updated_at = now()
  `;

  console.log(
    JSON.stringify({
      ok: true,
      companyId: company.id,
      tenantId: tenant.id,
      userId,
    })
  );
} finally {
  await sql.end({ timeout: 5 });
}

const isMain =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (!isMain) {
  // imported as module
}
