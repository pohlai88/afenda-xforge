import { Badge } from "@repo/ui/components/badge";
import type { ComponentProps, ReactElement } from "react";
import { renderMetadataAction } from "../adapters";
import type { MetadataActionContract } from "../contracts/action-renderer.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";

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
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
            {eyebrow}
          </p>
        ) : null}

        <div className="space-y-1">
          <h2 className="font-semibold text-2xl tracking-tight">{title}</h2>
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
              {renderMetadataAction({
                action,
                context,
                onAction,
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
