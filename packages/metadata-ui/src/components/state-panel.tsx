import { Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import type { ReactElement, ReactNode } from "react";

export type StatePanelTone = "danger" | "info" | "neutral" | "warning";

export type StatePanelAction =
  | {
      disabled?: boolean;
      href: string;
      label: string;
      onClick?: never;
    }
  | {
      disabled?: boolean;
      href?: never;
      label: string;
      onClick: () => void;
    };

type StatePanelProps = {
  action?: StatePanelAction;
  children?: ReactNode;
  description?: string;
  title: string;
  tone?: StatePanelTone;
};

const toneStyles: Record<
  StatePanelTone,
  { border: string; icon: string; surface: string; text: string }
> = {
  danger: {
    border: "border-destructive/30",
    icon: "!",
    surface: "bg-destructive/5",
    text: "text-destructive",
  },
  info: {
    border: "border-sky-200 dark:border-sky-900",
    icon: "i",
    surface: "bg-sky-50 dark:bg-sky-950/20",
    text: "text-sky-700 dark:text-sky-300",
  },
  neutral: {
    border: "border-border",
    icon: "•",
    surface: "bg-card",
    text: "text-foreground",
  },
  warning: {
    border: "border-amber-200 dark:border-amber-900",
    icon: "!",
    surface: "bg-amber-50 dark:bg-amber-950/20",
    text: "text-amber-700 dark:text-amber-300",
  },
};

function renderAction(
  action: StatePanelAction | undefined,
  tone: StatePanelTone
): ReactElement | null {
  if (!action) {
    return null;
  }

  const variant = tone === "neutral" ? "default" : "outline";

  if ("href" in action) {
    return (
      <Button
        asChild
        className={action.disabled ? "pointer-events-none opacity-60" : ""}
        size="sm"
        variant={variant}
      >
        <a
          aria-disabled={action.disabled ? true : undefined}
          href={action.disabled ? undefined : action.href}
          tabIndex={action.disabled ? -1 : undefined}
        >
          {action.label}
        </a>
      </Button>
    );
  }

  return (
    <Button
      disabled={action.disabled}
      onClick={action.onClick}
      size="sm"
      type="button"
      variant={variant}
    >
      {action.label}
    </Button>
  );
}

export function StatePanel({
  action,
  children,
  description,
  title,
  tone = "neutral",
}: StatePanelProps): ReactElement {
  const style = toneStyles[tone];

  return (
    <Card className={`${style.border} ${style.surface} shadow-sm`}>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`flex size-10 shrink-0 items-center justify-center rounded-full border ${style.border} ${style.text}`}
            >
              <span className="font-semibold text-sm">{style.icon}</span>
            </div>
            <div className="space-y-1">
              <CardTitle className={`text-xl ${style.text}`}>{title}</CardTitle>
              {description ? (
                <p className="text-muted-foreground text-sm leading-6">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          {renderAction(action, tone)}
        </div>
      </CardHeader>
      {children ? <CardContent>{children}</CardContent> : null}
    </Card>
  );
}
