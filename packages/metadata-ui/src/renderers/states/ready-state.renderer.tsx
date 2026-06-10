import type { ReactElement, ReactNode } from "react";

import type { MetadataStateRenderer } from "../../contracts/state-renderer.contract";

type ReadyStateProps = {
  children?: ReactNode;
};

export function ReadyState({ children }: ReadyStateProps): ReactElement | null {
  if (!children) {
    return null;
  }

  return <>{children}</>;
}

export const ReadyStateRenderer: MetadataStateRenderer = ({ children }) => (
  <ReadyState>{children}</ReadyState>
);
