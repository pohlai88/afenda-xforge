grant usage on schema xforge to authenticated;

grant select on table xforge.tenants to authenticated;
grant select on table xforge.companies to authenticated;
grant select on table xforge.customers to authenticated;
grant select on table xforge.tenant_memberships to authenticated;
grant select on table xforge.company_grants to authenticated;

alter table xforge.tenants enable row level security;
alter table xforge.companies enable row level security;
alter table xforge.customers enable row level security;
alter table xforge.tenant_memberships enable row level security;
alter table xforge.company_grants enable row level security;

drop policy if exists "authenticated users can read accessible tenants" on xforge.tenants;
create policy "authenticated users can read accessible tenants"
on xforge.tenants
for select
to authenticated
using (
  exists (
    select 1
    from xforge.tenant_memberships as tenant_memberships
    where tenant_memberships.tenant_id = tenants.id
      and tenant_memberships.user_id = (select auth.uid())::text
  )
);

drop policy if exists "authenticated users can read accessible companies" on xforge.companies;
create policy "authenticated users can read accessible companies"
on xforge.companies
for select
to authenticated
using (
  exists (
    select 1
    from xforge.tenant_memberships as tenant_memberships
    where tenant_memberships.tenant_id = companies.tenant_id
      and tenant_memberships.user_id = (select auth.uid())::text
  )
);

drop policy if exists "authenticated users can read accessible customers" on xforge.customers;
create policy "authenticated users can read accessible customers"
on xforge.customers
for select
to authenticated
using (
  exists (
    select 1
    from xforge.tenant_memberships as tenant_memberships
    where tenant_memberships.tenant_id = customers.tenant_id
      and tenant_memberships.user_id = (select auth.uid())::text
  )
);

drop policy if exists "authenticated users can read own tenant memberships" on xforge.tenant_memberships;
create policy "authenticated users can read own tenant memberships"
on xforge.tenant_memberships
for select
to authenticated
using ((select auth.uid())::text = tenant_memberships.user_id);

drop policy if exists "authenticated users can read own company grants" on xforge.company_grants;
create policy "authenticated users can read own company grants"
on xforge.company_grants
for select
to authenticated
using ((select auth.uid())::text = company_grants.user_id);
