# Metadata UI

`@repo/metadata-ui` is the composition boundary between declarative metadata and reusable UI primitives.

Rule of ownership:

- if the component needs `EntityMetadata` to decide what to render, it belongs here
- if the component is a primitive control or shared visual variant, it belongs in `@repo/ui`
- if the component owns business rules, persistence, or runtime authority, it does not belong here

It provides:

- metadata table and panel composition
- registry-driven field, action, and section renderers
- state-boundary surfaces for loading, empty, error, forbidden, and ready states
- compatibility helpers for existing `EntityMetadataPanel` and `EntityMetadataTable` consumers

It does not own:

- business rules
- authorization finality
- mutation execution
- persistence
- primitive component variants

Allowed dependencies:

- `@repo/metadata`
- `@repo/ui`

Example: compose UI primitives with metadata

```tsx
import type { EntityMetadata } from "@repo/metadata";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui";
import { EntityMetadataPanel } from "@repo/metadata-ui/components";

const invoiceMetadata: EntityMetadata = {
  id: "billing.invoices",
  entity: "invoice",
  title: "Invoices",
  description: "Metadata-driven invoice surface.",
  labels: { singular: "Invoice", plural: "Invoices" },
  table: {
    defaultSort: "number",
    columns: [
      { key: "number", label: "Invoice", field: "number", sortable: true },
      { key: "customer", label: "Customer", field: "customer", sortable: true },
      { key: "status", label: "Status", field: "status", kind: "status", sortable: true },
    ],
  },
};

const rows = [
  { id: "inv-001", number: "INV-001", customer: "Acme", status: "active" },
  { id: "inv-002", number: "INV-002", customer: "Globex", status: "inactive" },
];

export function MetadataBoundaryExample() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>UI primitives composed locally</CardTitle>
          <Badge variant="secondary">Metadata UI</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline">Filter</Button>
            <Button>New invoice</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.number}</TableCell>
                  <TableCell>{row.customer}</TableCell>
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EntityMetadataPanel metadata={invoiceMetadata} rows={rows} />
    </div>
  );
}
```

The package keeps rendering logic declarative and uses the root `@repo/ui` surface rather than deep component imports.

See `examples/metadata-boundary.example.tsx` for a package-local fixture that composes `Button`, `Card`, `Badge`, and `Table` with `EntityMetadata`.

## Renderer Catalog

<!-- metadata-ui-generated-renderer-catalog:start -->
<!-- This section is auto-generated. Do not edit manually. -->

| Kind | Registry Key | Renderer Export | Compose Group |
| --- | --- | --- | --- |
| action | `button` | `ButtonActionRenderer` | `button` |
| action | `destructive` | `DestructiveActionRenderer` | `alert-dialog` |
| action | `menu` | `MenuActionRenderer` | `dropdown-menu` |
| field | `checkbox` | `CheckboxFieldRenderer` | `checkbox` |
| field | `date` | `DateFieldRenderer` | `date-selector` |
| field | `email` | `TextFieldRenderer` | `input-group` |
| field | `money` | `MoneyFieldRenderer` | `input-group` |
| field | `number` | `NumberFieldRenderer` | `number-field` |
| field | `select` | `SelectFieldRenderer` | `combobox` |
| field | `status` | `TextFieldRenderer` | `badge` |
| field | `switch` | `SwitchFieldRenderer` | `field` |
| field | `text` | `TextFieldRenderer` | `field` |
| field | `textarea` | `TextareaFieldRenderer` | `field` |
| section | `activity` | `MetadataSectionRenderer` | `timeline` |
| section | `approval` | `MetadataSectionRenderer` | `alert-dialog` |
| section | `card` | `MetadataCardSectionRenderer` | `card` |
| section | `chart` | `MetadataCardSectionRenderer` | `chart` |
| section | `dashboard` | `MetadataSectionRenderer` | `statistic-card` |
| section | `details` | `MetadataCardSectionRenderer` | `card` |
| section | `evidence` | `MetadataCardSectionRenderer` | `file-upload` |
| section | `form` | `MetadataFormSectionRenderer` | `field` |
| section | `kanban` | `MetadataSectionRenderer` | `kanban` |
| section | `list` | `MetadataTableSectionRenderer` | `data-grid` |
| section | `section` | `MetadataSectionRenderer` | `frame` |
| section | `stat` | `MetadataCardSectionRenderer` | `statistic-card` |
| section | `table` | `MetadataTableSectionRenderer` | `data-grid` |
| section | `timeline` | `MetadataSectionRenderer` | `timeline` |
| section | `workflow` | `MetadataSectionRenderer` | `stepper` |
| state | `degraded` | `DegradedStateRenderer` | `alert` |
| state | `empty` | `EmptyStateRenderer` | `empty` |
| state | `error` | `ErrorStateRenderer` | `alert` |
| state | `forbidden` | `ForbiddenStateRenderer` | `alert` |
| state | `invalid` | `InvalidStateRenderer` | `alert` |
| state | `loading` | `LoadingStateRenderer` | `skeleton` |
| state | `maintenance` | `MaintenanceStateRenderer` | `alert` |
| state | `partial` | `PartialStateRenderer` | `frame` |
| state | `readonly` | `ReadonlyStateRenderer` | `frame` |
| state | `ready` | `ReadyStateRenderer` | `frame` |
<!-- metadata-ui-generated-renderer-catalog:end -->
