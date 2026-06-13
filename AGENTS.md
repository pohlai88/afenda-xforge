# XForge Agent Guide

afenda-Xforge follows the XForge architecture contract. When instructions conflict with implementation drift, update the implementation to match the architecture — not the other way around.

**Stack:** TypeScript · pnpm · Turborepo · Next.js 16+ (`apps/app`) · PostgreSQL · Drizzle.

Scoped detail lives in `.cursor/rules/*.mdc` (see index in `project-general.mdc`). Deterministic policies are enforced by `.cursor/hooks.json`.

---

## Read order

1. User instruction in the current message
2. This file + `skills/reference/*.md`
3. `.cursor/rules/*.mdc` for the paths you touch
4. Next.js APIs → MCP `nextjs_docs` from `nextjs-docs://llms-index` — **do not guess** from training data

---

## Agent behavior

### Answer before you build

- Yes/no and advice → direct answer in prose **first**, then code if needed
- Smallest correct diff; do not refactor unrelated files while "helping"

### UI layer order (visual / UX work)

| Order | Layer | Path |
|-------|-------|------|
| 1 | App wiring / previews | `apps/app/` · `theme-studio/` · `apps/storybook/` |
| 2 | Entity surfaces | `@repo/metadata-ui` |
| 3 | Workspace compose | `packages/ui/.../compose/workspace/` — **human-owned; ask first** |

Do not edit workspace compose for Theme Studio, Storybook contrast, branding previews, or polish. Fix at app wiring or preview layer first.

### Enforced by hooks (`.cursor/hooks.json`)

| Policy | Hook | Event |
|--------|------|-------|
| No destructive git on WIP | `block-destructive-git.mjs` | `beforeShellExecution` |
| No dev/start unless asked | `block-dev-servers.mjs` | `beforeShellExecution` |
| pnpm monorepo | `warn-wrong-package-manager.mjs` | `beforeShellExecution` |
| Workspace compose protected | `guard-workspace-compose.mjs` | `preToolUse` |
| NEXT_PUBLIC_ secrets | `guard-next-public-env.mjs` | `preToolUse` |
| Vercel prod deploy / MCP deploy / env pull | `ask-vercel-*`, `guard-vercel-deploy-mcp` | shell / MCP |
| Scoped quality gates | `stop-quality-gates.mjs` | `stop` (self-heal ×3) |

Everything else — execution pipeline, security, UI patterns, performance — stays in rules.

---

## Source of truth

| Doc | Scope |
|-----|-------|
| `skills/reference/architecture.md` | Governance, tenant/company, execution, audit, permissions |
| `skills/reference/packages.md` | Package ownership, public entry points, feature shape |
| `skills/reference/customization.md` | Safe customization; deployment defaults |
| `skills/reference/setup.md` | Bootstrap, env contract, MCP wiring |

---

## Architecture (summary)

**Feature public surfaces:** `index.ts`, `contract.ts`, `schema.ts`, `metadata.ts`, `server.ts`, `manifest.ts`. Keep `actions.ts`, `queries.ts`, adapters, and tests internal unless deliberately published.

**Dependency direction:**

- Apps → feature root or `/server`
- Client → `/contract`, `/manifest`, `/metadata` only
- No sibling feature imports; no feature internals across packages
- `packages/shared` — narrow primitives only
- `packages/execution` — canonical mutation lifecycle
- `packages/audit` — audit events (not logging)
- `packages/database` — business records; `packages/storage` — object/file storage only

**Mutation pipeline (required order):**

authenticate → resolve tenant → verify membership → resolve company → verify grant → validate input → enforce permission → execute → write audit → post-commit effects after success.

Sensitive reads: validate input, enforce tenant/company scope, enforce permission, fail closed on sensitive fields.

**Metadata:** declarative only — labels, navigation, fields, filters, capabilities. No business execution logic or permission finality.

Full rules: `backend-execution.mdc`, `backend-security.mdc`.

---

## Next.js & MCP (`apps/app`)

Training data for Next.js App Router and Cache Components is stale. **Docs before code.**

### MCP setup (`.cursor/mcp.json` → `next-devtools`)

Requires Next.js 16+ and a running dev server (`/_next/mcp` on port **3000**).

1. MCP `init` with `project_path` → absolute path of **`apps/app`** (not repo root)
2. API / routing / cache questions → `nextjs_docs` — never answer from memory
3. With dev server up:
   - `nextjs_index` (pass `port: "3000"` if auto-discovery fails)
   - `nextjs_call` → `get_errors`, `get_routes`, `get_project_metadata`
4. Resolve reported errors before claiming UI/API work complete

### Static gates (no dev server)

```bash
pnpm --filter app typecheck
pnpm --filter app check:stability
```

Stop hook runs `check:stability` when `apps/app` changes. Full checklist: `nextjs-mcp-quality.mdc`, `vercel-deployment.mdc`, skill `.cursor/skills/xforge-nextjs-vercel/`.

**Do not** start `dev` / `build` / long-running servers unless the user asks — hook-enforced; avoids port conflicts.

---

## Vercel deployment

Primary deployable: **`apps/app`** (Next.js). Prefer managed platform over self-managed K8s/Terraform until scale requires it — see `skills/reference/customization.md` § Deployment.

### Environment variables

- Separate **development**, **preview**, and **production** values — never share production DB credentials with preview
- **`NEXT_PUBLIC_*` is browser-visible** — secrets, API keys, and connection strings belong in server-only env vars
- Env vars are **package-owned** — validate at build/startup with each package's schema; fail fast on missing required vars
- Sync local: `vercel env pull` (after linking); repo helpers: `pnpm env:sync`, `pnpm env:doctor`

### Runtime & build

- Default to **Node.js runtime** for routes needing full Node APIs; use **Edge** only when APIs are compatible — check before switching `export const runtime`
- Preview deployments for PR testing before production promotion
- Turborepo + pnpm: run narrow package gates locally before push; CI should mirror `check:stability` for `apps/app`
- Long mutations → respect function timeout limits; use durable workflows or background jobs for work that exceeds serverless bounds

### Anti-patterns

| Issue | Fix |
|-------|-----|
| Secrets in `NEXT_PUBLIC_` | Server-only env vars |
| Preview hitting production DB | Separate preview database / branch DB |
| Stale pages after deploy | Review cache tags, `revalidate`, Cache Components invalidation |
| Env missing at runtime but present at build | Confirm Vercel env scope (Production / Preview / Development) |

---

## Tooling gates

Run the **narrowest** relevant command first, then widen:

```bash
pnpm --filter <package> typecheck
pnpm --filter <package> test
pnpm --filter <package> lint
pnpm --filter app check:stability    # apps/app: boundaries + typecheck + smoke
pnpm lint:biome
pnpm lint:architecture
pnpm check
pnpm knip                          # unused exports/deps — knip.jsonc
```

Biome guards style and import restrictions. `tools/check-architecture-boundaries.mjs` guards rules Biome cannot express.

---

## Change discipline

- Prefer existing package patterns over new abstractions
- Keep public package exports explicit
- Do not add UI for a domain package unless the pattern requires it
- Do not weaken security to make tests pass
- Scaffold-backed features: state that clearly; keep boundaries ready for real persistence, audit, and execution
