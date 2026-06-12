# Supabase Notes

This directory contains Supabase-specific scaffolding for XForge.

## Included

- `functions/notifications-dispatch/index.ts`
  - Edge Function used to fan out realtime notification broadcasts.
- `sql/xforge_client_rls.sql`
  - RLS and grant statements for the client-facing `xforge` tables.
- `sql/notifications_rls.sql`
  - RLS and grant statements for durable inbox rows and private broadcast topic access.
- `sql/search_rls.sql`
  - Read-only view, `search_workspace_documents` RPC, RLS, and grants for Postgres workspace search via PostgREST.
- `sql/rls_auto_enable_hardening.sql`
  - Moves the Supabase auto-RLS event trigger helper into a private schema and removes public RPC execution.

## Auth templates

The app now includes native Supabase SSR handlers at:

- `/auth/callback`
- `/auth/confirm`
- `/auth/error`

To complete email-based auth flows in the Supabase dashboard, update the Auth email templates so they send users to the server-side confirmation endpoint with the token hash:

- Confirm signup:
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}`
- Magic link:
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next={{ .RedirectTo }}`
- Password recovery, if enabled:
  `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next={{ .RedirectTo }}`

`emailRedirectTo` in the app now targets `/auth/callback?next=...`, so PKCE-based Supabase redirects and the email template flow both land inside the server-managed auth boundary.

## Apply order

1. Run the database migration generated from `packages/database/schema.ts`.
2. Apply `sql/rls_auto_enable_hardening.sql` if you use Supabase's auto-enable-RLS helper.
3. Apply `sql/xforge_client_rls.sql` against the Supabase project.
4. Apply `sql/notifications_rls.sql` against the Supabase project.
5. Apply `sql/search_rls.sql` when using `SEARCH_POSTGRES_READ_ADAPTER=supabase-postgrest`.
6. Deploy `functions/notifications-dispatch`.
7. Set function secrets and app env:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - optional `NEXT_PUBLIC_SUPABASE_NOTIFICATIONS_CHANNEL_PREFIX`
   - optional `SUPABASE_NOTIFICATIONS_CHANNEL_PREFIX`
   - optional `SUPABASE_NOTIFICATIONS_EDGE_FUNCTION`
   - when customizing the notifications channel prefix, set the same value in both prefix variables so the browser client and edge function stay aligned
   - optional `SEARCH_POSTGREST_URL` and `SEARCH_POSTGREST_KEY` when reads go through Supabase PostgREST
   - local Supabase exposes `xforge` in API schemas (`supabase/config.toml`); production may use `public.search_workspace_documents` from `search_rls.sql`
8. Authenticate the Supabase MCP client after `.mcp.json` is present.

## MCP

The repo-level `.mcp.json` points to:

- `https://mcp.supabase.com/mcp`

Endpoint reachability check should return `401` before authentication. That means the remote MCP server is reachable but not yet authorized.
