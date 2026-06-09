# Compose Registry

`compose` is the reusable pattern layer for metadata-driven UI preparation.
It is not a demo namespace.

Use it for generic, feature-agnostic patterns that can be selected by
`@repo/metadata-ui` through names, roles, and capabilities.

## Boundary

- `@repo/ui/components/compose` may expose primitive compositions, pattern
  catalogs, and registry metadata.
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

Preview-only galleries live under the internal `_previews` folder and are
available through the public alias:

```tsx
import {
  DataGridComposeGallery,
  composePreviewGalleryComponents,
} from "@repo/ui/components/compose/previews";
```

Use this subpath for docs, Storybook, and local inspection surfaces. Metadata
renderers should depend on registry names and capabilities instead of gallery
components.
