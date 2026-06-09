# UI Boundary

`@repo/ui` owns the reusable primitive and variant layer.

Rule of ownership:

- if a control is generic and can be reused across app shells, dashboards, CRUD pages, and feature packages, it belongs here
- if a control needs `EntityMetadata` or feature-specific contracts to render correctly, it belongs in `@repo/metadata-ui`
- if a control depends on business data, runtime authority, or feature internals, it does not belong here

Allowed ownership:

- shadcn-based primitives and their shared variants
- reusable app-facing controls that stay feature-agnostic
- purpose variants that still behave like generic controls, such as `metadata`, `crud`, `danger`, `ts`, `compact`, or `accent`

Forbidden ownership:

- metadata contracts
- metadata renderers
- business logic and runtime authority
- feature-package orchestration

Source layout:

- `src/components/ui-shadcn/*` for primitives and shared variants
- `src/components/compose/*` for generic composition patterns and registry metadata
- `src/components/*` for generic controls and examples
- `src/lib/*` for local helpers
- `src/styles/globals.css` for package-local token documentation

Dependency direction:

- forbidden: `@repo/ui -> @repo/metadata`
- forbidden: `@repo/ui -> @repo/metadata-ui`
- forbidden: `@repo/ui -> packages/features/*`

Example: generic UI variants live here

```tsx
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Separator,
} from "@repo/ui";

export function UiBoundaryExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generic controls</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Delete</Button>
      </CardContent>
      <Separator />
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  );
}
```

Example: purpose variants still belong here

```tsx
import { Button } from "@repo/ui";

export function MetadataPurposeButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline">Metadata</Button>
      <Button variant="secondary">CRUD</Button>
      <Button variant="ghost">TS</Button>
      <Button variant="destructive">Danger</Button>
    </div>
  );
}
```

See `examples/purpose-variants.example.tsx` for a package-local fixture version of this pattern.

## Compose registry

`compose` is a metadata-preparation layer, not a demo bucket. Import it through
the explicit subpath:

```tsx
import {
  composeRegistryGroups,
  getComposeRegistryPattern,
} from "@repo/ui/components/compose";
```

The registry is intentionally generic. It describes reusable patterns by group,
metadata role, capability, and pattern name so `@repo/metadata-ui` can decide
which UI pattern to render without `@repo/ui` importing metadata contracts.
Gallery components may exist for documentation, but metadata renderers should
prefer the registry contract.
