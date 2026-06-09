import type { EntityMetadata } from "@repo/metadata";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import type { ReactElement } from "react";

import { EntityMetadataPanel } from "../src/index";

const invoiceMetadata: EntityMetadata = {
  id: "billing.invoices",
  entity: "invoice",
  title: "Invoices",
  description: "Metadata-driven invoice surface.",
  labels: {
    singular: "Invoice",
    plural: "Invoices",
  },
  table: {
    defaultSort: "number",
    columns: [
      {
        key: "number",
        label: "Invoice",
        field: "number",
        sortable: true,
      },
      {
        key: "customer",
        label: "Customer",
        field: "customer",
        sortable: true,
      },
      {
        key: "status",
        label: "Status",
        field: "status",
        kind: "status",
        sortable: true,
      },
    ],
  },
};

const invoiceRows = [
  {
    id: "inv-001",
    customer: "Acme",
    number: "INV-001",
    status: "active",
  },
  {
    id: "inv-002",
    customer: "Globex",
    number: "INV-002",
    status: "inactive",
  },
];

export function MetadataBoundaryExample(): ReactElement {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>UI primitives composed for metadata</CardTitle>
          <Badge variant="secondary">Metadata UI</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline">Filter</Button>
            <Button>New invoice</Button>
          </div>

          <Separator />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoiceRows.map((row) => (
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

      <EntityMetadataPanel metadata={invoiceMetadata} rows={invoiceRows} />
    </div>
  );
}
