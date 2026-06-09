import type { ReactElement, ReactNode } from "react";

type ReadyStateProps = {
  children?: ReactNode;
};

export function ReadyState({ children }: ReadyStateProps): ReactElement | null {
  if (!children) {
    return null;
  }

  return <>{children}</>;
}
