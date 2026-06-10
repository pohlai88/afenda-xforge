import { Badge } from "@repo/ui";
import type { ComponentProps, ReactElement } from "react";
import { renderMetadataAction } from "../adapters";
import type { MetadataActionContract } from "../contracts/action-renderer.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import type { MetadataSurfaceKind } from "../contracts/surface.contract";
import {
  METADATA_TOOLBAR_BADGE_CLASS,
  METADATA_TOOLBAR_DESCRIPTION_CLASS,
  METADATA_TOOLBAR_EYEBROW_CLASS,
  METADATA_TOOLBAR_TITLE_CLASS,
} from "../visualization/content-length-visual-contract";
import {
  resolveDensitySurfaceProps,
  resolveDensityVisualDefinition,
} from "../visualization/density-visual-contract";
import { resolveSurfaceKindProps } from "../visualization/surface-visual-contract";
import { MetadataSurfaceRegion } from "./metadata-surface-region";

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
  surfaceKind?: MetadataSurfaceKind;
  title: string;
};

const wrapSurfaceRegion = (
  surfaceKind: MetadataSurfaceKind | undefined,
  region: "description" | "secondary-actions" | "title",
  node: ReactElement | null
): ReactElement | null => {
  if (!(node && surfaceKind)) {
    return node;
  }

  return (
    <MetadataSurfaceRegion kind={surfaceKind} region={region}>
      {node}
    </MetadataSurfaceRegion>
  );
};

export function MetadataToolbar({
  actions,
  badges,
  context,
  description,
  eyebrow,
  onAction,
  surfaceKind,
  title,
}: MetadataToolbarProps): ReactElement {
  const densityVisual = resolveDensityVisualDefinition(context.density);
  const titleNode = (
    <h2
      className={cn(
        densityVisual.toolbarTitleClass,
        METADATA_TOOLBAR_TITLE_CLASS
      )}
      title={title}
    >
      {title}
    </h2>
  );
  const descriptionNode = description ? (
    <p
      className={cn(
        "max-w-3xl text-muted-foreground text-sm leading-6",
        METADATA_TOOLBAR_DESCRIPTION_CLASS
      )}
      title={description}
    >
      {description}
    </p>
  ) : null;
  const actionsNode =
    actions && actions.length > 0 ? (
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
    ) : null;

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row lg:items-start lg:justify-between",
        densityVisual.toolbarGap
      )}
      {...resolveDensitySurfaceProps(context.density)}
      {...(surfaceKind ? resolveSurfaceKindProps(surfaceKind) : {})}
    >
      <div className={densityVisual.toolbarInnerSpacing}>
        {eyebrow ? (
          <p
            className={cn(
              "text-muted-foreground text-sm uppercase",
              METADATA_TOOLBAR_EYEBROW_CLASS
            )}
            title={eyebrow}
          >
            {eyebrow}
          </p>
        ) : null}

        <div className="space-y-1">
          {wrapSurfaceRegion(surfaceKind, "title", titleNode)}
          {description
            ? wrapSurfaceRegion(surfaceKind, "description", descriptionNode)
            : null}
        </div>

        {badges && badges.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {badges.map((badge) => (
              <Badge
                key={badge.label}
                title={badge.label}
                variant={normalizeBadgeVariant(badge.variant)}
              >
                <span className={METADATA_TOOLBAR_BADGE_CLASS}>
                  {badge.label}
                </span>
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      {wrapSurfaceRegion(surfaceKind, "secondary-actions", actionsNode)}
    </div>
  );
}
