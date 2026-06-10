"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "@repo/ui";
import type { MouseEvent, ReactElement } from "react";

import type {
  MetadataActionContract,
  MetadataActionRendererProps,
  MetadataActionSurface,
} from "../../contracts/action-renderer.contract";
import { METADATA_DIALOG_MOTION_CLASS } from "../../interaction/motion-visual-contract";
import {
  requiresActionConfirmation,
  resolveActionConfirmationCopy,
} from "./action-confirmation";
import type { ActionVisualDefinition } from "./action-visual-matrix";

type BaseActionRendererProps = MetadataActionRendererProps & {
  visual: ActionVisualDefinition;
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

function handleDirectActionClick(
  event: MouseEvent<HTMLElement>,
  props: MetadataActionRendererProps
): void {
  const { action, onAction } = props;

  if (action.disabled) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  onAction?.(action);
}

function renderActionTrigger(
  props: BaseActionRendererProps,
  surface: MetadataActionSurface,
  confirmationRequired: boolean
): ReactElement {
  const { action, onAction, visual } = props;
  const commonProps = {
    "aria-disabled": action.disabled || undefined,
    "aria-haspopup": visual.ariaHasPopup,
    "data-action-surface": surface,
    tabIndex: action.disabled ? -1 : undefined,
    title: action.title,
  } as const;

  const clickHandler = confirmationRequired
    ? undefined
    : (event: MouseEvent<HTMLElement>): void => {
        handleDirectActionClick(event, { ...props, action, onAction });
      };

  if (action.href) {
    return (
      <Button
        asChild
        disabled={action.disabled}
        size="sm"
        variant={visual.buttonVariant}
      >
        <a
          {...commonProps}
          href={action.disabled ? undefined : action.href}
          onClick={clickHandler}
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
      onClick={clickHandler}
      size="sm"
      type="button"
      variant={visual.buttonVariant}
    >
      {action.label}
    </Button>
  );
}

function renderConfirmedAction(props: BaseActionRendererProps): ReactElement {
  const { action, onAction, visual } = props;
  const surface = visual.surface;
  const confirmation = resolveActionConfirmationCopy(action, surface);
  const confirmVariant =
    visual.buttonVariant === "destructive" ? "destructive" : "default";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {renderActionTrigger(props, surface, true)}
      </AlertDialogTrigger>
      <AlertDialogContent
        className={METADATA_DIALOG_MOTION_CLASS}
        data-action-confirmation={surface}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{confirmation.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {confirmation.message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{confirmation.cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(): void => {
              if (!action.disabled) {
                onAction?.(action);
              }
            }}
            variant={confirmVariant}
          >
            {confirmation.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function BaseActionRenderer(
  props: BaseActionRendererProps
): ReactElement {
  const { visual } = props;
  const surface = visual.surface;

  if (requiresActionConfirmation(props.action, surface)) {
    return renderConfirmedAction(props);
  }

  return renderActionTrigger(props, surface, false);
}
