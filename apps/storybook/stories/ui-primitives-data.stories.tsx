import {
  Avatar,
  AvatarFallback,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "UI/Primitives/Data",
  parameters: {
    layout: "centered",
    a11y: { test: "error" as const },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const AvatarFallbackExample: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
};

export const DataTable: Story = {
  render: () => (
    <Table className="w-full max-w-lg">
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>INV-001</TableCell>
          <TableCell>Acme</TableCell>
          <TableCell className="text-right tabular-nums">1,200.50</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>INV-002</TableCell>
          <TableCell>Globex</TableCell>
          <TableCell className="text-right tabular-nums">800.25</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
