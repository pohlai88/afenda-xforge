"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import * as React from "react";

import { copyToClipboard } from "../../lib/clipboard";
import { cn } from "../../lib/utils";
import { Button } from "./button";

function CopyButton({
  value,
  className,
  variant = "ghost",
  size = "icon-sm",
  copiedDurationMs = 2000,
  onCopiedChange,
  ...props
}: React.ComponentProps<typeof Button> & {
  value: string;
  copiedDurationMs?: number;
  onCopiedChange?: (copied: boolean) => void;
}) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    if (!hasCopied) {
      return;
    }

    const timer = window.setTimeout(() => {
      setHasCopied(false);
      onCopiedChange?.(false);
    }, copiedDurationMs);

    return () => window.clearTimeout(timer);
  }, [copiedDurationMs, hasCopied, onCopiedChange]);

  return (
    <Button
      data-slot="copy-button"
      data-copied={hasCopied}
      aria-label={hasCopied ? "Copied" : "Copy"}
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={async (event) => {
        props.onClick?.(event);

        if (event.defaultPrevented) {
          return;
        }

        const didCopy = await copyToClipboard(value);

        if (!didCopy) {
          return;
        }

        setHasCopied(true);
        onCopiedChange?.(true);
      }}
      {...props}
    >
      <span className="sr-only">{hasCopied ? "Copied" : "Copy"}</span>
      {hasCopied ? (
        <CheckIcon className="size-4" />
      ) : (
        <CopyIcon className="size-4" />
      )}
    </Button>
  );
}

export { CopyButton };
