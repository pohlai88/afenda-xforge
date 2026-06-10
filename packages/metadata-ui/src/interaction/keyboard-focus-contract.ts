import type { KeyboardEvent } from "react";

export const METADATA_FOCUS_VISIBLE_RING_CLASS =
  "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export const METADATA_INTERACTIVE_LINK_CLASS = [
  "rounded-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:underline",
  METADATA_FOCUS_VISIBLE_RING_CLASS,
].join(" ");

export const METADATA_INTERACTIVE_ROW_CLASS = [
  "cursor-pointer hover:bg-muted/50 focus-visible:ring-offset-2",
  METADATA_FOCUS_VISIBLE_RING_CLASS,
].join(" ");

export function handleKeyboardActivation(
  event: KeyboardEvent<HTMLElement>,
  action: () => void
): void {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  action();
}
