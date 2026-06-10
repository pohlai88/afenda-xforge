import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
  Button,
} from "@repo/ui";
import type { ReactElement, ReactNode } from "react";
import type {
  StatePanelAction,
  StatePanelTone,
} from "../../components/state-panel";
import { StatePanel } from "../../components/state-panel";
import type { MetadataUiState } from "../../contracts/render-context.contract";
import { StateVisualIconGlyph } from "./state-visual-icons";
import type { StateVisualIcon } from "./state-visual-matrix";
import { resolveStateVisualDefinition } from "./state-visual-matrix";

type MetadataStateShellProps = {
  action?: StatePanelAction;
  children?: ReactNode;
  description?: string;
  stateKind: MetadataUiState;
  title?: string;
  tone?: StatePanelTone;
  variant?: "banner" | "panel";
};

const alertVariantByTone: Record<
  StatePanelTone,
  "default" | "destructive" | "info" | "warning"
> = {
  danger: "destructive",
  info: "info",
  muted: "default",
  neutral: "default",
  warning: "warning",
};

export function MetadataStateShell({
  action,
  children,
  description,
  stateKind,
  title,
  tone,
  variant = "panel",
}: MetadataStateShellProps): ReactElement {
  const definition = resolveStateVisualDefinition(stateKind);
  const resolvedTone = tone ?? definition.tone;
  const resolvedTitle = title ?? definition.defaultTitle;
  const resolvedDescription = description ?? definition.defaultDescription;
  const icon: StateVisualIcon = definition.icon;

  if (variant === "banner") {
    return (
      <div className="space-y-4" data-state={stateKind}>
        <Alert variant={alertVariantByTone[resolvedTone]}>
          <StateVisualIconGlyph icon={icon} />
          <AlertTitle>{resolvedTitle}</AlertTitle>
          <AlertDescription>{resolvedDescription}</AlertDescription>
          {action ? (
            <AlertAction>
              <Button
                disabled={action.disabled}
                onClick={"onClick" in action ? action.onClick : undefined}
                size="sm"
                type="button"
                variant="outline"
              >
                {action.label}
              </Button>
            </AlertAction>
          ) : null}
        </Alert>
        {children ? <div data-slot="state-content">{children}</div> : null}
      </div>
    );
  }

  return (
    <div data-state={stateKind}>
      <StatePanel
        action={action}
        description={resolvedDescription}
        icon={<StateVisualIconGlyph icon={icon} />}
        title={resolvedTitle}
        tone={resolvedTone}
      >
        {children}
      </StatePanel>
    </div>
  );
}
