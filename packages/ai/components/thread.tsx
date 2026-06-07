import type { HTMLAttributes, ReactElement } from "react";
import { twMerge } from "tailwind-merge";

export type ThreadProps = HTMLAttributes<HTMLDivElement> & {
  ariaLabel?: string;
};

export const Thread = ({
  children,
  className,
  ariaLabel = "Conversation thread",
  ...props
}: ThreadProps): ReactElement => (
  <div
    aria-label={ariaLabel}
    aria-live="polite"
    aria-relevant="additions text"
    className={twMerge(
      "flex flex-1 flex-col items-start gap-4 overflow-y-auto p-8 pb-0",
      className
    )}
    role="log"
    {...props}
  >
    {children}
  </div>
);
