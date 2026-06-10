# [Feature Name]

## Business Definition

**[Feature Name] is the HRM function that [describe the business capability in one clear sentence, focusing on what the feature enables and for whom].**

---

# [Feature Name] Includes

| Area | What It Covers |
| --- | --- |
| **[Capability Area 1]** | [Business scope covered by this area] |
| **[Capability Area 2]** | [Business scope covered by this area] |
| **[Capability Area 3]** | [Business scope covered by this area] |
| **[Capability Area 4]** | [Business scope covered by this area] |
| **[Capability Area 5]** | [Business scope covered by this area] |

---

# [Feature Name] Does Not Include

| Excluded Area | Owned By |
| --- | --- |
| [Excluded concern 1] | [Owning feature / module / domain] |
| [Excluded concern 2] | [Owning feature / module / domain] |
| [Excluded concern 3] | [Owning feature / module / domain] |
| [Excluded concern 4] | [Owning feature / module / domain] |

---

# Source of Truth Ownership

| Data / Business Object | Source of Truth | Notes |
| --- | --- | --- |
| [Business object 1] | [Owning feature / module / domain] | [State the canonical owner and what this feature may or may not do.] |
| [Business object 2] | [Owning feature / module / domain] | [State the canonical owner and what this feature may or may not do.] |
| [Business object 3] | [Owning feature / module / domain] | [State the canonical owner and what this feature may or may not do.] |
| [Business object 4] | [Owning feature / module / domain] | [State the canonical owner and what this feature may or may not do.] |

---

# Boundary Rules

| Rule | Requirement |
| --- | --- |
| Tenant boundary | All reads and writes must resolve execution context before accessing data. |
| Permission boundary | All mutations must check capability or permission before execution. |
| Audit boundary | All state-changing actions must write an audit event. |
| API boundary | Public routes must not bypass feature contracts, schemas, or policies. |
| UI boundary | UI must consume projections or read models, not raw persistence models. |

Add feature-specific boundary rules where needed, but do not weaken these platform rules.

---

# [Feature Name] Requirement Statement

| Requirement | Description |
| --- | --- |
| **[Feature Name]** | [One concise statement describing the end-user or business capability delivered by this feature.] |

---

# Enterprise Functional Requirements

| Code | Requirement |
| --- | --- |
| **[DOMAIN-CODE-001]** | System shall [clear functional behavior]. |
| **[DOMAIN-CODE-002]** | System shall [clear functional behavior]. |
| **[DOMAIN-CODE-003]** | System shall [clear functional behavior]. |
| **[DOMAIN-CODE-004]** | System shall [clear functional behavior]. |
| **[DOMAIN-CODE-005]** | System shall [clear functional behavior]. |

Guidance:

- Use one requirement per row.
- Start each requirement with `System shall`.
- Keep each requirement testable and implementation-neutral.
- Separate business capability from technical design unless the design constraint is mandatory.

---

# Enterprise Acceptance Criteria

| No. | Acceptance Criteria |
| --: | --- |
| 1 | [Observable outcome that proves the feature works.] |
| 2 | [Observable outcome that proves the feature works.] |
| 3 | [Observable outcome that proves the feature works.] |
| 4 | [Observable outcome that proves the feature works.] |
| 5 | [Observable outcome that proves the feature works.] |

Guidance:

- Write acceptance criteria as observable user or system outcomes.
- Keep criteria measurable, verifiable, and free of implementation detail where possible.
- Ensure each criterion maps back to one or more functional requirements.

---

# Definition of Done

This section replaces separate package-level `dod.md` files. It should state the minimum bar for calling the feature or package change complete.

| Area | Done When |
| --- | --- |
| Architecture and boundaries | The change preserves documented ownership, source-of-truth rules, dependency boundaries, and platform governance constraints. |
| Contracts and schemas | Public contracts are explicit, stable, validated at runtime where needed, and aligned with the documented scope. |
| Validation and policy enforcement | Invalid inputs, invalid scope, policy violations, and unsafe state transitions fail clearly and safely. |
| Resolution or runtime behavior | Runtime behavior is deterministic, does not mutate canonical source data unexpectedly, and respects published-vs-draft or equivalent lifecycle rules. |
| Tests and verification | The changed behavior is covered by targeted tests, and the relevant lint, typecheck, and test commands pass. |
| Documentation | This document, code references, and any public usage guidance reflect the actual implementation and boundary decisions. |
| Release readiness | The implemented slice is safe to enable for its intended audience, or the remaining gaps are explicitly documented as out of scope. |

Guidance:

- Write this section as completion criteria, not as aspiration.
- Keep each row auditable and specific to the feature boundary.
- If a category does not apply, say so explicitly instead of omitting it.

---

# Implementation Status

**Status:** [Not started | In progress | Partial | Implemented]

**Last audited:** [YYYY-MM-DD]

This document reflects the actual codebase for the audited [feature or slice name] boundary. It should describe what is currently implemented, what has been verified in code, and what remains incomplete. Keep this section factual and evidence-based.

| Area | Status | Evidence |
| --- | --- | --- |
| Feature contracts and schemas | [Implemented / Partial / Not started] | [`path/to/file`](./path/to/file) |
| Authorization and policy boundary | [Implemented / Partial / Not started] | [`path/to/file`](./path/to/file) |
| Source-of-truth integration | [Implemented / Partial / Not started] | [`path/to/file`](./path/to/file) |
| Repository and persistence | [Implemented / Partial / Not started] | [`path/to/file`](./path/to/file) |
| Queries, projections, or read models | [Implemented / Partial / Not started] | [`path/to/file`](./path/to/file) |
| Actions, workflows, or mutations | [Implemented / Partial / Not started] | [`path/to/file`](./path/to/file) |
| HTTP or API routes | [Implemented / Partial / Not started] | [`path/to/file`](./path/to/file) |
| Requirement coverage registry | [Implemented / Partial / Not started] | [`path/to/file`](./path/to/file) |
| Verification tests | [Implemented / Partial / Not started] | [`path/to/test`](./path/to/test) |

### Planning Mark

- `Current audited slices: [REQ-001, REQ-002, ...]`
- `Slice status: [complete / partial / planned]`
- `Feature status: [fully implemented / partially implemented / not implemented]`

---

# Requirement Coverage

This section should list only requirements that are implemented and verified by package code, API surface, permissions, source-of-truth ownership, and tests. Do not mark a requirement as implemented if evidence is missing.

| Requirement | Status | Evidence |
| --- | --- | --- |
| [DOMAIN-CODE-001] | [Implemented / Partial / Not started] | [`path/to/file`](./path/to/file) |
| [DOMAIN-CODE-002] | [Implemented / Partial / Not started] | [`path/to/file`](./path/to/file) |
| [DOMAIN-CODE-003] | [Implemented / Partial / Not started] | [`path/to/file`](./path/to/file) |

---

# Element-by-Element Code Evaluation

This evaluation reflects the actual codebase as of [YYYY-MM-DD] for the audited [feature boundary]. Each row should explain the current implementation state, cite code evidence, and state the constraint that future slices must preserve.

| Element | Current Status | Code Evidence | Reference for Next Slice Development |
| --- | --- | --- | --- |
| [Element 1] | [Implemented / Partial / Not started. Summarize the behavior clearly.] | [`path/to/file`](./path/to/file) | [What future work must preserve, reuse, or avoid.] |
| [Element 2] | [Implemented / Partial / Not started. Summarize the behavior clearly.] | [`path/to/file`](./path/to/file) | [What future work must preserve, reuse, or avoid.] |
| [Element 3] | [Implemented / Partial / Not started. Summarize the behavior clearly.] | [`path/to/file`](./path/to/file) | [What future work must preserve, reuse, or avoid.] |

---

# Verification Summary

1. `[command used to verify type safety]`
2. `[command used to verify linting]`
3. `[command used to verify tests]`
4. `[additional verification command if applicable]`

Verification should prove the implemented slice, not just the package compiles.
