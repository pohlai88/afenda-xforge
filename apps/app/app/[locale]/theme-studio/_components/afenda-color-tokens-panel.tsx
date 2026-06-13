"use client";

import type {
  AfendaRuntimeToken,
  AfendaRuntimeTokenSnapshot,
} from "@repo/design-system/css/tokens";
import {
  AFENDA_APCA_CONTRAST_TARGETS,
  assessApcaContrastLevel,
  calcApcaLc,
  formatApcaLc,
} from "@repo/design-system/css/tokens";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  ColorContrast,
  ColorContrastBadge,
  ColorContrastRatio,
  ColorPalette,
  ColorSwatch,
  ColorSwatchLabel,
  ColorSwatchPart,
  ColorToken,
} from "@repo/ui/components/token-ui";
import type { ReactElement } from "react";
import { useLayoutEffect, useRef, useState } from "react";

import { PREVIEW_PANEL_CLASS } from "./theme-studio-shared.tsx";

type AfendaColorGroup = {
  description: string;
  group: AfendaRuntimeToken["group"];
  label: string;
};

const AFENDA_COLOR_GROUPS: readonly AfendaColorGroup[] = [
  {
    label: "Base",
    description: "Application surfaces, borders, and foreground pairs.",
    group: "color.base",
  },
  {
    label: "Brand",
    description: "Primary, secondary, and accent brand roles.",
    group: "color.brand",
  },
  {
    label: "Status",
    description: "Semantic status colors — independent of tenant brand.",
    group: "color.status",
  },
  {
    label: "Chart",
    description: "Dedicated chart series tokens.",
    group: "color.chart",
  },
  {
    label: "Sidebar",
    description: "Workspace sidebar chrome and navigation accents.",
    group: "color.sidebar",
  },
] as const;

const BRAND_APCA_PAIRS = [
  { againstToken: "primary-foreground", name: "primary" },
  { againstToken: "secondary-foreground", name: "secondary" },
  { againstToken: "accent-foreground", name: "accent" },
] as const;

function toCssVar(token: string): string {
  return `var(--${token})`;
}

function resolveTokenValue(token: AfendaRuntimeToken): string {
  return String(token.resolvedValue);
}

function toColorStops(tokens: readonly AfendaRuntimeToken[]) {
  return tokens.map((token) => ({
    name: token.name,
    value: resolveTokenValue(token),
  }));
}

function ResolvedApcaSwatch({
  againstToken,
  name,
}: {
  againstToken: string;
  name: string;
}): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const [baseColor, setBaseColor] = useState<string | null>(null);
  const [againstColor, setAgainstColor] = useState<string | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    setBaseColor(getComputedStyle(element).backgroundColor);

    const probe = document.createElement("div");
    probe.style.color = toCssVar(againstToken);
    probe.style.display = "none";
    element.appendChild(probe);
    setAgainstColor(getComputedStyle(probe).color);
    probe.remove();
  }, [againstToken]);

  const apcaLc =
    baseColor && againstColor ? calcApcaLc(againstColor, baseColor) : null;
  const apcaLevel =
    apcaLc === null
      ? "fail"
      : assessApcaContrastLevel(apcaLc, "standardUiText");

  return (
    <ColorSwatch
      className="min-h-20 hover:flex-[1.08]"
      name={name}
      ref={ref}
      value={toCssVar(name)}
    >
      <ColorSwatchLabel>{name}</ColorSwatchLabel>
      {apcaLc === null ? null : (
        <ColorSwatchPart
          className="text-white drop-shadow-sm"
          position="bottom-left"
        >
          <ColorContrast
            against={againstColor ?? ""}
            base={baseColor ?? ""}
            passes={apcaLevel}
            ratio={formatApcaLc(apcaLc)}
          >
            <span className="text-xs">APCA</span>
            <ColorContrastRatio />
            <ColorContrastBadge variant="pill" />
          </ColorContrast>
        </ColorSwatchPart>
      )}
    </ColorSwatch>
  );
}

type AfendaColorTokensPanelProps = {
  snapshot: AfendaRuntimeTokenSnapshot;
};

export function AfendaColorTokensPanel({
  snapshot,
}: AfendaColorTokensPanelProps): ReactElement {
  const tokenizedColors = snapshot.tokens.filter(
    (token): token is AfendaRuntimeToken =>
      token.type === "color" && token.displayComponent === "ColorToken"
  );

  return (
    <section className="space-y-6" id="afenda-color-tokens">
      <div className="space-y-2">
        <h2 className="font-semibold text-xl tracking-tight">Color tokens</h2>
        <p className="max-w-3xl text-muted-foreground text-sm leading-6">
          Semantic palettes from Afenda registries, rendered with Token UI{" "}
          <code className="text-xs">ColorPalette</code> and{" "}
          <code className="text-xs">ColorContrast</code>. Contrast uses APCA Lc
          first ({AFENDA_APCA_CONTRAST_TARGETS.standardUiText}+ for UI text,{" "}
          {AFENDA_APCA_CONTRAST_TARGETS.criticalText}+ for body copy), with WCAG
          AA kept as a secondary gate.
        </p>
      </div>

      <Card className={PREVIEW_PANEL_CLASS}>
        <CardHeader>
          <CardTitle>Tokenized color chips</CardTitle>
          <CardDescription>
            Runtime-resolved color entries from{" "}
            <code className="text-xs">AfendaRuntimeTokenSnapshot.tokens</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {tokenizedColors.map((token) => (
            <ColorToken
              key={token.name}
              name={token.name}
              value={resolveTokenValue(token)}
            />
          ))}
        </CardContent>
      </Card>

      {AFENDA_COLOR_GROUPS.map((group) => {
        const groupTokens = tokenizedColors.filter(
          (token) => token.group === group.group
        );

        return (
          <Card className={PREVIEW_PANEL_CLASS} key={group.label}>
            <CardHeader>
              <CardTitle>{group.label}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ColorPalette
                colors={toColorStops(groupTokens)}
                label={`${group.label} palette`}
              />

              {group.label === "Brand" ? (
                <div className="space-y-2">
                  <p className="font-medium text-sm">
                    Brand contrast (APCA Lc)
                  </p>
                  <div className="flex overflow-hidden rounded-md border">
                    {BRAND_APCA_PAIRS.map((pair) => (
                      <ResolvedApcaSwatch
                        againstToken={pair.againstToken}
                        key={pair.name}
                        name={pair.name}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
