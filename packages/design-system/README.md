# Design System Boundary

`@repo/design-system` owns styling infrastructure.

Allowed ownership:
- global CSS
- theme providers
- toaster/provider composition
- low-level styling utilities
- primitive design-system components

Do not use it as the application-facing UI package.

Application and feature code should:
- import presentational components from `@repo/ui`
- import global styles from `@repo/design-system/styles/globals.css`
- import provider wiring from `@repo/design-system`

`@repo/design-system` must not import `@repo/ui`.
