import type { ReactElement, ReactNode } from "react";

import type { MetadataStateRenderer } from "../../contracts/state-renderer.contract";
import { MetadataStateShell } from "./metadata-state-shell";

type ReadonlyStateProps = {
  children?: ReactNode;
  description?: string;
  title?: string;
};

export function ReadonlyState({
  children,
  description,
  title,
}: ReadonlyStateProps): ReactElement {
  return (
    <MetadataStateShell
      description={description}
      stateKind="readonly"
      title={title}
      variant="banner"
    >
      {children}
    </MetadataStateShell>
  );
}

export const ReadonlyStateRenderer: MetadataStateRenderer = ({ children }) => (
  <ReadonlyState>{children}</ReadonlyState>
);
