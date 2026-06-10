import { composeRegistryGroups } from "@repo/ui";
import type { Meta, StoryObj } from "@storybook/react";

function ComposeRegistryTable() {
  return (
    <div className="mx-auto w-full max-w-6xl p-6 md:p-10">
      <header className="mb-8 space-y-2">
        <h1 className="font-semibold text-2xl tracking-tight">
          Compose registry
        </h1>
        <p className="text-muted-foreground text-sm leading-6">
          Metadata-facing compose groups from <code>@repo/ui</code>. Preview
          galleries in <strong>UI / Compose</strong> document rendered patterns.
        </p>
      </header>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Group</th>
              <th className="px-4 py-3 font-medium">Kind</th>
              <th className="px-4 py-3 font-medium">Readiness</th>
              <th className="px-4 py-3 font-medium">Roles</th>
              <th className="px-4 py-3 font-medium">Patterns</th>
            </tr>
          </thead>
          <tbody>
            {composeRegistryGroups.map((group) => (
              <tr className="border-b last:border-b-0" key={group.name}>
                <td className="px-4 py-3 font-medium">{group.title}</td>
                <td className="px-4 py-3">{group.kind}</td>
                <td className="px-4 py-3">{group.readiness}</td>
                <td className="px-4 py-3">{group.metadataRoles.join(", ")}</td>
                <td className="px-4 py-3">{group.patterns.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const meta = {
  title: "UI/Compose Registry",
  component: ComposeRegistryTable,
  parameters: {
    layout: "fullscreen",
    a11y: { test: "error" as const },
    docs: {
      description: {
        component:
          "Reference table for compose registry groups in `@repo/ui`. Each row's **readiness** reflects metadata-facing maturity (stable, beta, experimental). **Roles** list `metadataRoles` consumed by manifest `composeGroup` bindings. Match a renderer's compose group to the corresponding gallery under UI / Compose.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ComposeRegistryTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
