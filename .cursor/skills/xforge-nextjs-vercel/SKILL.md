---
name: xforge-nextjs-vercel
description: >-
  XForge Next.js 16 + Vercel workflow for apps/app. Covers next-devtools MCP
  (init, nextjs_docs, nextjs_index, nextjs_call) and Vercel plugin MCP
  (search_vercel_documentation, deploy, deployment logs). Use when changing
  apps/app, App Router, Cache Components, Server Actions, env vars,
  NEXT_PUBLIC_*, Vercel deploy, preview/production, or runtime errors.
---

# XForge Next.js + Vercel

Repo contract: `AGENTS.md` · rules: `nextjs-mcp-quality.mdc`, `vercel-deployment.mdc` · hooks enforce env secrets + deploy gates.

## Decision tree

| Task | Use |
|------|-----|
| Next.js API / routing / cache / RSC | **next-devtools** MCP |
| Vercel platform / env scoping / limits | **Vercel** MCP `search_vercel_documentation` |
| Local type safety | `pnpm --filter app typecheck` |
| Pre-merge app gate | `pnpm --filter app check:stability` |
| Pre-deploy build | `pnpm --filter app build` |
| Runtime errors (dev up) | `nextjs_call` → `get_errors` |

**Never** answer Next.js or Vercel platform behavior from training data.

## Next.js MCP — session start (MUST)

1. MCP **`init`** — `project_path` = absolute `…/apps/app`
2. Read MCP resource **`nextjs-docs://llms-index`**
3. **`nextjs_docs`** with exact path from index for any API question
4. If user requested dev / server already on **3000**:
   - `nextjs_index` (pass `port: "3000"` if needed)
   - `nextjs_call` → `toolName: "get_errors"` (omit empty `args`)

## Before claiming apps/app work complete

```
- [ ] init called this session
- [ ] Behavior checked via nextjs_docs (not memory)
- [ ] pnpm --filter app check:stability passes
- [ ] If dev server up: get_errors is clean
```

Stop hook auto-runs `check:stability` when `apps/app` changed.

## Vercel — deploy workflow

1. Local gates: `typecheck` → `check:stability` → `build`
2. Confirm env: preview DB ≠ production; no secrets in `NEXT_PUBLIC_*` (hook-enforced)
3. Deploy: preview default; production only with explicit user approval (hook on `--prod` / MCP deploy)
4. Post-deploy: `get_deployment`, `get_deployment_build_logs`; runtime issues → `get_runtime_logs`

Env sync: `vercel env pull` (hook asks — may overwrite `.env.local`); then `pnpm env:doctor`.

## Hooks (deterministic)

| Policy | Script |
|--------|--------|
| NEXT_PUBLIC_ secrets | `guard-next-public-env.mjs` |
| Production deploy CLI | `ask-vercel-production.mjs` |
| Vercel MCP deploy | `guard-vercel-deploy-mcp.mjs` |
| vercel env pull | `ask-vercel-env-pull.mjs` |
| No unsolicited dev | `block-dev-servers.mjs` |

## Additional reference

Tool catalog, sharp edges, and extended checklists: [reference.md](reference.md)
