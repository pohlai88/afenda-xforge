import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Skeleton } from "@repo/ui/components/skeleton";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Foundations/Primitives",
  parameters: {
    layout: "padded",
  },
};

export default meta;

type Story = StoryObj;

export const Controls: Story = {
  render: () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4 rounded-xl border bg-card p-5">
        <div className="space-y-1">
          <p className="font-medium text-sm">Buttons</p>
          <p className="text-muted-foreground text-sm">
            Shared primitives for actions, links, and destructive flows.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button asChild variant="link">
            <a href="#">Link action</a>
          </Button>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-5">
        <div className="space-y-1">
          <p className="font-medium text-sm">Inputs</p>
          <p className="text-muted-foreground text-sm">
            Base field treatment for search, filters, and metadata forms.
          </p>
        </div>

        <div className="grid gap-3">
          <Input placeholder="Search customers, invoices, or tasks" />
          <Input aria-invalid placeholder="Invalid state" />
          <Input disabled placeholder="Disabled state" />
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-5 lg:col-span-2">
        <div className="space-y-1">
          <p className="font-medium text-sm">Loading</p>
          <p className="text-muted-foreground text-sm">
            Skeleton states used across the table and health widgets.
          </p>
        </div>

        <div className="space-y-3 rounded-lg border bg-background p-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </section>
    </div>
  ),
};
