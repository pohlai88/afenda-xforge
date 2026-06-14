# Afenda Design System Brief

Scoped to `@repo/design-system` — typed visual vocabulary, tokens, and presentation metadata for XForge ERP surfaces.

## 1. Product purpose

Afenda defines the governed visual language — tokens, variants, lanes, and presentation resolution — that ERP surfaces use to stay consistent, tenant-brandable, and agent-verifiable without encoding business authority.

## 2. Primary user

A design engineer or agent authoring metadata-driven UI for finance and operations teams on 13–15" laptops, switching between dense tables and focused forms in long daily sessions.

## 3. Principles

1. **Show the data, not the design.** — 90% neutral surfaces; color reserves status, lane identity, and one primary CTA. Decorative chrome loses to scannability.
2. **Lane is identity, not action.** — ERP module lanes tint nav and badges only; they never replace `--primary`, focus rings, or operational status colors.
3. **Wrong is worse than late.** — Contrast, hue reservation, and forbidden customization keys are enforced at contract time; presentation metadata cannot carry permission or workflow authority.
4. **Platform chrome ≠ tenant identity.** — `vercel-geist` for pre-tenant surfaces; `afenda` for tenant ERP identity. Do not collapse into a single default preset.
5. **Metadata resolves; components render.** — Declarative `{ density, variant, tone, size, lane }` resolves to token bundles here; React stays in `@repo/ui`.

## 4. Success metric

A consumer can pass presentation metadata to `resolvePresentationMetadata()` and receive a complete `{ cssVariables, tailwindClasses, dataAttributes }` bundle without hand-picking palette utilities or raw OKLCH literals.

## 5. Out of scope

- React component implementations (`@repo/ui`)
- Entity field/section/action metadata (`@repo/metadata`, `@repo/metadata-ui`)
- Permission finality, tenant resolution, audit policy, or execution pipeline keys in presentation contracts
- Marketing landing aesthetics or editorial long-form layouts
- Motion beyond hover and focus (CRAFT 7, MOTION 3)

## Craft knobs

| Knob | Value | Notes |
|------|-------|-------|
| CRAFT_LEVEL | 7 | Contract + token spine; polish pass on token-ui only |
| MOTION_INTENSITY | 3 | Hover/focus only; honor `prefers-reduced-motion` |
| VISUAL_DENSITY | 7 | compact / default / comfortable; dashboard-adjacent |

## Style anchor

Sharp geometric ERP admin: OKLCH neutrals (hue ~258), Geist sans + mono for data, varied radii (6px controls, 10px cards, 14px panels), layered elevation over flat borders.
