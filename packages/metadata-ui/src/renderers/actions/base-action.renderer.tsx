import { Button } from "@repo/ui";
import type { MouseEvent, ReactElement } from "react";

import type {
  MetadataActionContract,
  MetadataActionRendererProps,
} from "../../contracts/action-renderer.contract";

type MetadataActionButtonVariant = "default" | "destructive" | "ghost";

type BaseActionRendererProps = MetadataActionRendererProps & {
  ariaHasPopup?: "menu";
  variant: MetadataActionButtonVariant;
};

function resolveRel(action: MetadataActionContract): string | undefined {
  if (action.target !== "_blank") {
    return action.rel;
  }

  const rel = new Set((action.rel ?? "").split(" ").filter(Boolean));
  rel.add("noopener");
  rel.add("noreferrer");

  return Array.from(rel).join(" ");
}

function handleActionClick(
  event: MouseEvent<HTMLElement>,
  props: MetadataActionRendererProps
): void {
  const { action, onAction } = props;

  if (action.disabled) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  const confirmationMessage =
    action.confirmationPolicy?.message ?? action.confirmMessage;

  if (confirmationMessage) {
    const confirm = globalThis.window?.confirm;

    if (typeof confirm === "function" && !confirm(confirmationMessage)) {
      event.preventDefault();
      return;
    }
  }

  onAction?.(action);
}

export function BaseActionRenderer({
  action,
  ariaHasPopup,
  onAction,
  variant,
  ...props
}: BaseActionRendererProps): ReactElement {
  const commonProps = {
    "aria-disabled": action.disabled || undefined,
    "aria-haspopup": ariaHasPopup,
    onClick: (event: MouseEvent<HTMLElement>): void => {
      handleActionClick(event, { ...props, action, onAction });
    },
    tabIndex: action.disabled ? -1 : undefined,
    title: action.title,
  } as const;

  if (action.href) {
    return (
      <Button asChild disabled={action.disabled} size="sm" variant={variant}>
        <a
          {...commonProps}
          href={action.disabled ? undefined : action.href}
          rel={resolveRel(action)}
          target={action.target}
        >
          {action.label}
        </a>
      </Button>
    );
  }

  return (
    <Button
      {...commonProps}
      disabled={action.disabled}
      size="sm"
      variant={variant}
    >
      {action.label}
    </Button>
  );
}
