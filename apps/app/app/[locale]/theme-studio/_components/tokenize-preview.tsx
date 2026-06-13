"use client";

import {
  groupAfendaRuntimeTokensByDisplayComponent,
  resolveAfendaRuntimeTokenSnapshot,
  type AfendaRuntimeTokenSnapshot,
} from "@repo/design-system";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { TooltipProvider } from "@repo/ui/components/ui/tooltip";
import { AfendaTokenDisplay } from "@repo/ui/components/token-ui";
import { cn } from "@repo/ui/lib/utils";
import type { ReactElement } from "react";
import { useMemo } from "react";

import { useResolvedColorMode } from "../../../_components/feature-lane-scope.tsx";
import { useTenantBranding } from "../../../_components/tenant-branding-context.tsx";
import { AfendaColorTokensPanel } from "./afenda-color-tokens-panel.tsx";
import {
  PREVIEW_PANEL_CLASS,
  PreviewHeader,
  PreviewPageShell,
} from "./theme-studio-shared.tsx";

type TokenizePreviewProps = {
  snapshot: AfendaRuntimeTokenSnapshot;
};

function RangeStatusBadge({
  inRange,
  apcaInRange,
  apcaLc,
  apcaTarget,
  namingInRange,
}: {
  apcaInRange: boolean | null;
  apcaLc: number | null;
  apcaTarget: number | null;
  inRange: boolean;
  namingInRange: boolean;
}): ReactElement | null {
  if (inRange) {
    return (
      <Badge className="font-mono text-[10px]" variant="success-light">
        in range
      </Badge>
    );
  }

  if (!namingInRange) {
    return (
      <Badge className="font-mono text-[10px]" variant="destructive-light">
        naming
      </Badge>
    );
  }

  if (apcaInRange === false && apcaLc !== null && apcaTarget !== null) {
    return (
      <Badge className="font-mono text-[10px]" variant="warning-light">
        APCA {apcaLc.toFixed(0)} / {apcaTarget}
      </Badge>
    );
  }

  return (
    <Badge className="font-mono text-[10px]" variant="destructive-light">
      out of range
    </Badge>
  );
}

export function TokenizePreviewPanel({
  snapshot,
}: TokenizePreviewProps): ReactElement {
  const componentGroups = groupAfendaRuntimeTokensByDisplayComponent(snapshot);
  const outOfRangeTotal = componentGroups.reduce(
    (total, group) => total + group.outOfRangeCount,
    0,
  );

  return (
    <PreviewPageShell>
      <PreviewHeader
        description="Afenda tokens mapped to Token UI components (DTCG $type → displayComponent). Out-of-range flags naming prefix violations and APCA Lc misses on color pairs."
        previewNumber="08"
        scores={[
          { label: "Tokenized", value: snapshot.tokens.length },
          { label: "Components", value: componentGroups.length },
          {
            label: "Out of range",
            value: outOfRangeTotal,
          },
        ]}
        title="Tokenize"
      />

      <TooltipProvider delayDuration={200}>
        <AfendaColorTokensPanel snapshot={snapshot} />

        <div className="grid gap-6">
          {componentGroups.map((group) => (
            <Card className={PREVIEW_PANEL_CLASS} id={group.component} key={group.component}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="font-mono text-base">{group.title}</CardTitle>
                  <Badge className="font-mono text-[10px]" variant="outline">
                    {group.dtcgType}
                  </Badge>
                  {group.outOfRangeCount > 0 ? (
                    <Badge className="font-mono text-[10px]" variant="warning-light">
                      {group.outOfRangeCount} out of range
                    </Badge>
                  ) : (
                    <Badge className="font-mono text-[10px]" variant="success-light">
                      all in range
                    </Badge>
                  )}
                </div>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {group.tokens.map((token) => (
                    <div
                      className={cn(
                        "flex flex-col gap-1",
                        !token.range.inRange && "rounded-md ring-1 ring-warning/40",
                      )}
                      key={token.name}
                    >
                      <AfendaTokenDisplay token={token} />
                      <RangeStatusBadge
                        apcaInRange={token.range.apcaInRange}
                        apcaLc={token.range.apcaLc}
                        apcaTarget={token.range.apcaTarget}
                        inRange={token.range.inRange}
                        namingInRange={token.range.namingInRange}
                      />
                    </div>
                  ))}
                </div>
                <ul className="space-y-3 border-border border-t pt-4">
                  {group.tokens.map((token) => (
                    <li className="space-y-1" key={`${token.name}-meta`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-foreground text-xs">{token.name}</p>
                        <span className="text-muted-foreground text-xs">
                          prefix {token.range.expectedPrefix}
                        </span>
                        <RangeStatusBadge
                          apcaInRange={token.range.apcaInRange}
                          apcaLc={token.range.apcaLc}
                          apcaTarget={token.range.apcaTarget}
                          inRange={token.range.inRange}
                          namingInRange={token.range.namingInRange}
                        />
                      </div>
                      <p className="text-muted-foreground text-xs">{token.description}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </TooltipProvider>
    </PreviewPageShell>
  );
}

export function TokenizePreview(): ReactElement {
  const { effectiveBranding } = useTenantBranding();
  const mode = useResolvedColorMode();
  const snapshot = useMemo(
    () => resolveAfendaRuntimeTokenSnapshot(effectiveBranding, mode),
    [effectiveBranding, mode],
  );

  return <TokenizePreviewPanel snapshot={snapshot} />;
}
