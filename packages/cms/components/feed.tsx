import type { ReactElement, ReactNode } from "react";

export type FeedProps = {
  children?: ReactNode;
};

export const Feed = ({ children }: FeedProps): ReactElement => <>{children}</>;
