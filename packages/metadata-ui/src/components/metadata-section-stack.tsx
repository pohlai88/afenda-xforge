import type { ReactElement } from "react";

import type { MetadataRenderContext } from "../contracts/render-context.contract";
import type { MetadataSectionContract } from "../contracts/section-renderer.contract";
import { defaultSectionRegistry } from "../registry/default-section-registry";
import { MetadataForm } from "./metadata-form";
import { MetadataTable } from "./metadata-table";

export type MetadataSectionStackProps = {
  context?: Partial<MetadataRenderContext>;
  sections: readonly MetadataSectionContract[];
};

const createContext = (
  context: Partial<MetadataRenderContext> | undefined
): MetadataRenderContext => ({
  density: context?.density ?? "default",
  mode: context?.mode ?? "read",
  permissions: context?.permissions ?? {},
  state: context?.state ?? "ready",
});

export function MetadataSectionStack({
  context,
  sections,
}: MetadataSectionStackProps): ReactElement {
  const resolvedContext = createContext(context);

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        const renderer = defaultSectionRegistry.get(section.kind ?? "section");

        let children: ReactElement | null = null;

        if (section.kind === "table" && section.metadata) {
          children = (
            <MetadataTable
              context={resolvedContext}
              metadata={section.metadata}
              rows={section.rows ?? []}
              showSearch
            />
          );
        } else if (section.kind === "form" && section.fields) {
          children = (
            <MetadataForm
              actions={section.actions}
              context={resolvedContext}
              description={section.description}
              fields={section.fields}
              title={section.title}
            />
          );
        }

        return (
          <div key={section.key}>
            {renderer({
              children,
              context: resolvedContext,
              section,
            })}
          </div>
        );
      })}
    </div>
  );
}
