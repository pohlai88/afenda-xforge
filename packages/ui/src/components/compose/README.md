# Compose Registry

`compose` is the reusable pattern layer for metadata-driven UI preparation.
It is not a demo namespace.

Use it for generic, feature-agnostic patterns that can be selected by
`@repo/metadata-ui` through names, roles, and capabilities. The registry
contract is exposed from the root `@repo/ui` package so consumers do not need
deep subpath imports.

## Boundary

- The compose registry and its stable metadata contract are the only
  consumer-facing surface.
- It must not import `@repo/metadata`, `@repo/metadata-ui`, feature packages,
  database code, auth code, or server actions.
- Preview galleries may exist for documentation, but they are secondary to the
  typed registry contract.

## Registry Contract

The stable metadata-facing surface is:

- `composeRegistryGroups`
- `composeRegistryGroupNames`
- `composeRegistryPatternCount`
- `getComposeRegistryGroup`
- `getComposeRegistryPattern`
- `ComposeRegistryGroup`
- `ComposePatternSpec`

`@repo/metadata-ui` should map metadata contracts to registry group names,
pattern names, roles, and capabilities. Business data and permission finality
remain outside `@repo/ui`.

## Preview Galleries

Preview-only galleries can exist inside `@repo/ui` for local documentation and
Storybook, but they are not part of the cross-package public API. Metadata
renderers should depend on registry names and capabilities instead of gallery
components.
