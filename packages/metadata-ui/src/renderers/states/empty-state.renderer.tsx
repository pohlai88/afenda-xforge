import type { ReactElement } from "react";
import { StatePanel } from "../../components/state-panel";

type EmptyStateProps = {
  description?: string;
  title?: string;
};

export function EmptyState({
  description = "There is nothing to show yet.",
  title = "No records available",
}: EmptyStateProps): ReactElement {
  return <StatePanel description={description} title={title} tone="neutral" />;
}
