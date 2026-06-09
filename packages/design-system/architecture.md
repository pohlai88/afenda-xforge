# Design System Architecture

`@repo/design-system` owns typed design vocabulary for XForge.

It defines:

- design system identity
- token names
- component variant contracts
- sizing, density, and status tone contracts
- canonical token and variant registries

It does not own:

- React rendering
- shadcn primitives
- theme providers
- application business logic
- feature metadata

Dependency direction:

- allowed: no internal workspace dependencies
- forbidden: `@repo/ui`, `@repo/metadata`, `@repo/metadata-ui`
- forbidden: feature packages and runtime/business packages such as `@repo/auth`, `@repo/database`, `@repo/execution`, `@repo/permissions`, and `@repo/audit`

The intended 4-package split is:

```txt
design-system  -> design vocabulary
ui             -> React primitives / shadcn
metadata       -> declarative contracts
metadata-ui    -> metadata renderer
```
