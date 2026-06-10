# HR Console

Suite-level module console at `/hr/console` registered in System Admin.

## Governance modes

Per company and console, the platform resolves one of:

- `unassigned_fallback` — no active console operator. Tenant admin/owner with `system-admin.module-consoles.read` acts as implicit full operator (delegation + LAM writes). Mutations are audited with `governanceMode: "unassigned_fallback"` and `actingAsConsoleOperator: true`.
- `operator_assigned` — at least one active operator assignment exists. Assigned operator owns delegation and domain writes. System Admin retains operator assignment/revocation and console read access only.

## Authority matrix

| Action | unassigned_fallback | operator_assigned |
|--------|---------------------|-------------------|
| Assign/revoke console operator | System Admin | System Admin |
| Console overview/sections read | System Admin + granted readers | System Admin + operator + delegated |
| Delegate inside console | System Admin | Assigned operator only |
| Domain mutations (LAM writes) | System Admin | Operator + delegated |
| System Admin domain/delegation writes | Allowed | Denied (read-only) |

## Package surface

Standard feature entry points: `index.ts`, `contract.ts`, `schema.ts`, `metadata.ts`, `manifest.ts`, `server.ts`.

`manifest.ts` publishes `moduleConsoleRegistration` (including `defaultOperatorCapabilities`) for System Admin registry bootstrap in the app/API layer.

## Phase 1 sections (complete)

- Overview (`/hr/console`) — ready
- Delegation (`/hr/console/delegation`) — ready, execution pipeline + audit
- Leave & Attendance (`/hr/console/leave`) — LAM config API links

## Phase 2 sections (complete)

- Calendars (`/hr/console/calendars`) — work/holiday calendar config links (HRM-LAM-031)
- Attendance Policy (`/hr/console/policy`) — attendance policy config links (HRM-LAM-032)
- Encashment (`/hr/console/encashment`) — encashment policy config links (HRM-LAM-033)

LAM config writes resolve HR Console governance via `createLamConfigWriteContext` (HRM-LAM-034).

## Phase 3 (complete)

- System Admin operator assign/revoke via execution pipeline (`/system-admin/module-consoles`)
- Manifest-driven default operator capabilities (no control-plane HR hardcoding)
- Delegation subset enforcement and company-scoped revoke
- Operator assignment time bounds (`validFrom`/`validTo`) honored in governance resolver
- Phase 2 GET-by-ID API routes and per-capability config write gates

## Deferred

- Full CRUD UI for LAM config entities (hubs remain API link cards)
- Operational LAM routes (employee submit, approver flows) remain header/auth orchestration paths distinct from console config writes
- Encashment operational processing (policy apply / payroll reference) — configuration only in HRM-LAM-033
