import type { ReactElement } from "react";
import { StatePanel } from "../../components/state-panel";

type ForbiddenStateProps = {
  description?: string;
  title?: string;
};

export function ForbiddenState({
  description = "You do not have permission to view this surface.",
  title = "Access restricted",
}: ForbiddenStateProps): ReactElement {
  return <StatePanel description={description} title={title} tone="warning" />;
}
