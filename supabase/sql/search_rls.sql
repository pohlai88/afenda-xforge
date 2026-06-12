-- Workspace search read API for Supabase PostgREST.
-- Apply after packages/database migration for xforge.workspace_search_documents
-- (0014_workspace_search_documents.sql) and after sql/xforge_client_rls.sql.

grant usage on schema xforge to authenticated;

create or replace view xforge.workspace_search_documents_read as
select
  id,
  tenant_id,
  company_id,
  entity_type,
  entity_id,
  title,
  description,
  url,
  metadata,
  search_vector,
  indexed_at
from xforge.workspace_search_documents
where deleted_at is null;

grant select on xforge.workspace_search_documents_read to authenticated;

alter table xforge.workspace_search_documents_read enable row level security;

drop policy if exists "authenticated users can read accessible workspace search documents"
on xforge.workspace_search_documents_read;

create policy "authenticated users can read accessible workspace search documents"
on xforge.workspace_search_documents_read
for select
to authenticated
using (
  exists (
    select 1
    from xforge.tenant_memberships as tenant_memberships
    where tenant_memberships.tenant_id = workspace_search_documents_read.tenant_id
      and tenant_memberships.user_id = (select auth.uid())::text
  )
);

create or replace function xforge.search_workspace_documents(
  p_tenant_id uuid,
  p_query text,
  p_limit int default 25
)
returns table (
  id uuid,
  tenant_id uuid,
  company_id uuid,
  entity_type text,
  entity_id text,
  title text,
  description text,
  url text,
  metadata jsonb,
  indexed_at timestamptz,
  rank real
)
language sql
stable
security invoker
set search_path = xforge, pg_catalog
as $$
  select
    documents.id,
    documents.tenant_id,
    documents.company_id,
    documents.entity_type,
    documents.entity_id,
    documents.title,
    documents.description,
    documents.url,
    documents.metadata,
    documents.indexed_at,
    ts_rank(
      documents.search_vector,
      websearch_to_tsquery('english', p_query)
    ) as rank
  from xforge.workspace_search_documents_read as documents
  where documents.tenant_id = p_tenant_id
    and p_query is not null
    and length(trim(p_query)) >= 2
    and documents.search_vector @@ websearch_to_tsquery('english', p_query)
  order by rank desc, documents.title asc nulls last
  limit greatest(least(coalesce(p_limit, 25), 25), 1);
$$;

grant execute on function xforge.search_workspace_documents(uuid, text, int) to authenticated;

-- Public wrapper so PostgREST can reach the RPC when `xforge` is not in API schemas.
create or replace function public.search_workspace_documents(
  p_tenant_id uuid,
  p_query text,
  p_limit int default 25
)
returns table (
  id uuid,
  tenant_id uuid,
  company_id uuid,
  entity_type text,
  entity_id text,
  title text,
  description text,
  url text,
  metadata jsonb,
  indexed_at timestamptz,
  rank real
)
language sql
stable
security invoker
set search_path = xforge, pg_catalog
as $$
  select *
  from xforge.search_workspace_documents(p_tenant_id, p_query, p_limit);
$$;

grant execute on function public.search_workspace_documents(uuid, text, int) to authenticated;
