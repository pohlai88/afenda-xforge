# @repo/machine

Machine-layer product shell for XForge.

`@repo/machine` composes `@repo/ai` and feature packages through approved
server entrypoints. It owns the product-specific assistant orchestration,
context assembly, and prompt wiring for the machine layer.

Do not put generic AI SDK helpers or low-level model registry code here. That
belongs in `@repo/ai`.

Legacy Lynx type aliases remain exported for compatibility, but new code
should depend on the `@repo/machine` boundary.

Public doors:

- `@repo/machine/client` for pure module helpers, intent classification, and AI module constants
- `@repo/machine/contract` for the internal assistant route contract and OpenAPI registration
- `@repo/machine/server` for assistant orchestration, context assembly, and tool-backed chat execution
