import { Badge } from "@repo/ui/components/badge";
import { Card, CardContent } from "@repo/ui/components/card";
import { Progress } from "@repo/ui/components/ui/progress";
import { cn } from "@repo/ui/lib/utils";
import type { ReactElement, ReactNode } from "react";

/** Header shell radius — maps to `--radius-xl` in globals.css @theme */
export const PREVIEW_HEADER_CLASS = "rounded-xl";

/** Inner panel radius — maps to `--radius-lg` in globals.css @theme */
export const PREVIEW_PANEL_CLASS = "rounded-lg";

export type SemanticTone = "destructive" | "info" | "success" | "warning";

export const SEMANTIC_TONE_SURFACE: Record<SemanticTone, string> = {
  success:
    "border-success-border bg-success-muted text-success-muted-foreground",
  warning:
    "border-warning-border bg-warning-muted text-warning-muted-foreground",
  destructive:
    "border-destructive-border bg-destructive-muted text-destructive-muted-foreground",
  info: "border-info-border bg-info-muted text-info-muted-foreground",
};

export const SEMANTIC_TONE_SOLID: Record<SemanticTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
};

export const SEMANTIC_TONE_BADGE: Record<
  SemanticTone,
  "destructive-light" | "info-light" | "success-light" | "warning-light"
> = {
  success: "success-light",
  warning: "warning-light",
  destructive: "destructive-light",
  info: "info-light",
};

type PreviewScore = {
  label: string;
  value: number;
};

type PreviewHeaderProps = {
  actions?: ReactNode;
  description: string;
  previewNumber: string;
  scores: readonly PreviewScore[];
  title: string;
};

export function PreviewPageShell({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[1500px] flex-col gap-6 px-6 py-6 lg:px-8">
      {children}
    </div>
  );
}

export function PreviewHeader({
  actions,
  description,
  previewNumber,
  scores,
  title,
}: PreviewHeaderProps): ReactElement {
  return (
    <header
      className={cn(
        "border border-border bg-card p-6 shadow-sm",
        PREVIEW_HEADER_CLASS
      )}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Badge className="gap-2" variant="primary-light">
            <span className="size-2 rounded-full bg-primary shadow-[0_0_14px_var(--brand-primary)]" />
            Theme Studio · Preview {previewNumber}
          </Badge>
          <h1 className="font-semibold text-3xl tracking-tight md:text-4xl">
            {title}
          </h1>
          <p className="max-w-3xl text-muted-foreground text-sm leading-6 md:text-base">
            {description}
          </p>
          {actions ? (
            <div className="flex flex-wrap gap-2 pt-1">{actions}</div>
          ) : null}
        </div>

        <Card className="w-full max-w-xs shrink-0 shadow-sm">
          <CardContent className="space-y-3 pt-6">
            {scores.map((score) => (
              <ScoreRow
                key={score.label}
                label={score.label}
                value={score.value}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </header>
  );
}

type IntelligencePreviewHeaderProps = {
  description: string;
  previewNumber: string;
  scores: readonly PreviewScore[];
  title: string;
};

export function IntelligencePreviewHeader({
  description,
  previewNumber,
  scores,
  title,
}: IntelligencePreviewHeaderProps): ReactElement {
  return (
    <header
      className={cn(
        "relative overflow-hidden border border-lane-intelligence-border bg-card p-6 shadow-sm",
        PREVIEW_HEADER_CLASS
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-lane-intelligence-glow blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-10rem] left-[20%] size-64 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3">
          <Badge
            className="gap-2 border-lane-intelligence-border bg-lane-intelligence-muted text-lane-intelligence-muted-foreground"
            variant="outline"
          >
            <span className="size-2 rounded-full bg-lane-intelligence shadow-[0_0_14px_var(--lane-intelligence)]" />
            Theme Studio · Preview {previewNumber}
          </Badge>
          <h1 className="max-w-4xl font-semibold text-3xl tracking-tight md:text-4xl">
            {title}
          </h1>
          <p className="max-w-3xl text-muted-foreground text-sm leading-6 md:text-base">
            {description}
          </p>
        </div>

        <Card className="w-full max-w-xs shrink-0 border-border/80 bg-surface/90 shadow-sm backdrop-blur-sm">
          <CardContent className="space-y-3 pt-6">
            {scores.map((score) => (
              <ScoreRow
                key={score.label}
                label={score.label}
                value={score.value}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </header>
  );
}

export function ScoreRow({
  label,
  value,
}: {
  label: string;
  value: number;
}): ReactElement {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-tabular">{value}</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

export function ValidationNote({
  description,
  title,
}: {
  description: string;
  title: string;
}): ReactElement {
  return (
    <div
      className={cn("border border-border bg-surface p-4", PREVIEW_PANEL_CLASS)}
    >
      <p className="font-medium text-sm">{title}</p>
      <p className="mt-2 text-muted-foreground text-xs leading-5">
        {description}
      </p>
    </div>
  );
}

export function ValidationCard({
  className,
  description,
  title,
}: {
  className: string;
  description: string;
  title: string;
}): ReactElement {
  return (
    <div className={cn("border p-4", PREVIEW_PANEL_CLASS, className)}>
      <p className="font-medium text-sm">{title}</p>
      <p className="mt-2 text-xs leading-5">{description}</p>
    </div>
  );
}
