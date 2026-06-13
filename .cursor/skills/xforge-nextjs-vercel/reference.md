# Next.js + Vercel Reference (XForge)

## next-devtools MCP tools

| Tool | When |
|------|------|
| `init` | **First** call each session; `project_path` → `apps/app` |
| `nextjs_docs` | Any Next.js API — path from `nextjs-docs://llms-index` only |
| `nextjs_index` | Discover dev server tools; use before `nextjs_call` |
| `nextjs_call` | Runtime: `get_errors`, `get_routes`, `get_project_metadata` |
| `enable_cache_components` | Cache Components / PPR migration — after reading docs |
| `browser_eval` | Browser verification when dev server running |
| `upgrade_nextjs_16` | Version upgrade only — user-requested |

### nextjs_call notes

- `port` is required (string, e.g. `"3000"`)
- Omit `args` when tool has no parameters — do not pass `{}`
- Read input schema from `nextjs_index` before calling

## Vercel plugin MCP tools

| Tool | When |
|------|------|
| `search_vercel_documentation` | Platform behavior, env scoping, limits, routing |
| `deploy_to_vercel` | Deploy — hook asks for approval |
| `get_deployment` | Verify deploy status |
| `get_deployment_build_logs` | Build failures |
| `get_runtime_logs` | Production/preview runtime errors |
| `list_deployments` | Recent deploy history |
| `get_project` | Linked project metadata |

CLI equivalents: `vercel deploy` (preview), `vercel deploy --prod` (hook asks).

## Critical MUST criteria (rules + hooks)

### Rules only (judgment)

- Edge vs Node runtime compatibility
- Cache invalidation after mutations (`backend-execution.mdc`)
- Tenant/company scope on server routes (`backend-security.mdc`)
- Preview database isolation

### Hook-enforced

- No `NEXT_PUBLIC_*` secret-shaped keys/values
- No production deploy without approval
- No `vercel env pull` without approval
- No dev server unless user asked
- Stop gate: `check:stability` when `apps/app` changes

## Vercel sharp edges

| Issue | Severity | Action |
|-------|----------|--------|
| Secrets in `NEXT_PUBLIC_` | critical | Server-only env; hook blocks |
| Preview → production DB | high | Separate preview env + DB |
| Edge + Node-only APIs | high | `nextjs_docs` + switch runtime |
| Env missing at runtime | medium | Check Vercel env scope (Production/Preview/Development) |
| Stale pages post-deploy | medium | Cache tags / `revalidate` / Cache Components |
| Function timeout | medium | Background job or Workflow |

## Pre-deploy checklist

```bash
pnpm --filter app typecheck
pnpm --filter app check:stability
pnpm --filter app build
pnpm env:doctor
```

- [ ] Production env vars set in Vercel (not only local)
- [ ] Preview env does not reference production `DATABASE_URL`
- [ ] No new `NEXT_PUBLIC_*` secrets introduced
- [ ] Build logs clean after deploy

## Pre-UI-complete checklist (dev server available)

```bash
pnpm --filter app check:stability
```

MCP:

1. `nextjs_index` port 3000
2. `nextjs_call` `get_errors` — fix all reported issues
3. Optional: `get_routes` for new routes
