import { Badge } from "@repo/ui";
import type { ComponentProps, ReactElement } from "react";
import { renderMetadataAction } from "../adapters";
import type { MetadataActionContract } from "../contracts/action-renderer.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import {
  resolveDensitySurfaceProps,
  resolveDensityVisualDefinition,
} from "../visualization/density-visual-contract";

const cn = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(" ");

type MetadataToolbarBadge = {
  label: string;
  variant?:
    | "destructive"
    | "info"
    | "neutral"
    | "outline"
    | "primary"
    | "secondary"
    | "success"
    | "warning";
};

const normalizeBadgeVariant = (
  variant: MetadataToolbarBadge["variant"]
): ComponentProps<typeof Badge>["variant"] =>
  variant === "primary" ? "default" : (variant ?? "neutral");

export type MetadataToolbarProps = {
  actions?: readonly MetadataActionContract[];
  badges?: readonly MetadataToolbarBadge[];
  context: MetadataRenderContext;
  description?: string;
  eyebrow?: string;
  onAction?: (action: MetadataActionContract) => void;
  title: string;
};

export function MetadataToolbar({
  actions,
  badges,
  context,
  description,
  eyebrow,
  onAction,
  title,
}: MetadataToolbarProps): ReactElement {
  const densityVisual = resolveDensityVisualDefinition(context.density);

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row lg:items-start lg:justify-between",
        densityVisual.toolbarGap
      )}
      {...resolveDensitySurfaceProps(context.density)}
    >
      <div className={densityVisual.toolbarInnerSpacing}>
        {eyebrow ? (
          <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
            {eyebrow}
          </p>
        ) : null}

        <div className="space-y-1">
          <h2 className={densityVisual.toolbarTitleClass}>{title}</h2>
          {description ? (
            <p className="max-w-3xl text-muted-foreground text-sm leading-6">
              {description}
            </p>
          ) : null}
        </div>

        {badges && badges.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {badges.map((badge) => (
              <Badge
                key={badge.label}
                variant={normalizeBadgeVariant(badge.variant)}
              >
                {badge.label}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      {actions && actions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action) => (
            <div key={action.key}>
              {
                renderMetadataAction({
                  action,
                  context,
                  onAction,
                }).element
              }
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
