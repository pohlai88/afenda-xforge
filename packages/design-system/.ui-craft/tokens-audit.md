# Token Spine Audit — @repo/design-system

Audited against ui-craft 3-layer contract (2026-06-14).

| Severity | Category | Finding | Status |
|----------|----------|---------|--------|
| High | Primitives | OKLCH literals embedded in css-theme.ts — no named gray ramp | Resolved — `primitive-color.registry.ts` |
| High | Semantics | Strong — color-token.registry + :root/.dark generation | OK |
| Medium | Component | Variant/size registries without CSS var bindings | Resolved — `component-token.registry.ts` |
| Medium | Dark mode | Intentional dark — tinted near-black, reduced chroma, elevation swap | OK |
| Low | Z-index | order tokens in registry-token-specs | OK — documented in token catalog |
| Low | Motion | Duration tokens present; MOTION 3 in brief | OK |
| Low | Cross-package | metadata-ui mirrors visual/density contracts | OK — `metadata-ui-mirror-parity.test.ts` + `check-metadata-ui-design-system-parity.mjs` |
