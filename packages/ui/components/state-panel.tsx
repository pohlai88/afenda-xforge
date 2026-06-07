"use client";

import { Button } from "@repo/design-system/components/ui/button";
import { cn } from "@repo/design-system/lib/utils";
import { AlertCircle, Inbox, Info, ShieldAlert } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

export type StatePanelTone = "danger" | "info" | "neutral" | "warning";

type StatePanelAction =
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
  className?: string;
  description?: string;
  eyebrow?: string;
  icon?: ReactNode;
  title: string;
  tone?: StatePanelTone;
};

const toneStyles: Record<
  StatePanelTone,
  {
    background: string;
    border: string;
    icon: string;
    title: string;
  }
> = {
  danger: {
    background: "bg-destructive-muted",
    border: "border-destructive-border",
    icon: "text-destructive-muted-foreground",
    title: "text-destructive-muted-foreground",
  },
  info: {
    background: "bg-info-muted",
    border: "border-info-border",
    icon: "text-info-muted-foreground",
    title: "text-info-muted-foreground",
  },
  neutral: {
    background: "bg-card",
    border: "border-border",
    icon: "text-muted-foreground",
    title: "text-foreground",
  },
  warning: {
    background: "bg-warning-muted",
    border: "border-warning-border",
    icon: "text-warning-muted-foreground",
    title: "text-warning-muted-foreground",
  },
};

const iconContainerClassName = (tone: StatePanelTone): string =>
  cn(
    "flex size-10 shrink-0 items-center justify-center rounded-full border",
    tone === "neutral" ? "bg-muted/50" : "bg-background/70",
    toneStyles[tone].border,
    toneStyles[tone].icon
  );

const defaultIcon = (tone: StatePanelTone): ReactElement => {
  if (tone === "danger") {
    return <ShieldAlert className="size-5" />;
  }

  if (tone === "warning") {
    return <AlertCircle className="size-5" />;
  }

  if (tone === "info") {
    return <Info className="size-5" />;
  }

  return <Inbox className="size-5" />;
};

const renderAction = (
  action: StatePanelAction | undefined,
  tone: StatePanelTone
): ReactElement | null => {
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
      variant={variant}
    >
      {action.label}
    </Button>
  );
};

export const StatePanel = ({
  action,
  children,
  className,
  description,
  eyebrow,
  icon,
  title,
  tone = "neutral",
}: StatePanelProps): ReactElement => {
  const styles = toneStyles[tone];

  return (
    <section
      className={cn(
        "rounded-xl border p-6 shadow-sm",
        styles.background,
        styles.border,
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div aria-hidden="true" className={iconContainerClassName(tone)}>
          {icon ?? defaultIcon(tone)}
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-1">
            {eyebrow ? (
              <p className="font-medium text-[11px] text-muted-foreground uppercase tracking-[0.16em]">
                {eyebrow}
              </p>
            ) : null}

            <h3 className={cn("font-semibold text-base", styles.title)}>
              {title}
            </h3>

            {description ? (
              <p className="max-w-2xl text-muted-foreground text-sm leading-6">
                {description}
              </p>
            ) : null}
          </div>

          {children ? <div className="space-y-3">{children}</div> : null}

          {renderAction(action, tone)}
        </div>
      </div>
    </section>
  );
};
