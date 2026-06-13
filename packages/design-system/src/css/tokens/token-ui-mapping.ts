import {
  AFENDA_APCA_CONTRAST_TARGETS,
  calcApcaLc,
  type ApcaContrastLevel,
} from "./apca-contrast";
import { resolveCssVarChain } from "./css-var.util";
import type { CssVarMap } from "../../customise-branding/resolution";
import type { AfendaRuntimeToken, AfendaRuntimeTokenSnapshot } from "./runtime-token-snapshot";
import {
  AFENDA_TOKEN_UI_COMPONENT_NAV,
  assessAfendaTokenUiNaming,
  getAfendaTokenUiNavEntry,
  type AfendaTokenUiDisplayComponent,
  type AfendaTokenizedTokenType,
} from "../../contracts/afenda/token-ui.contract";

export {
  AFENDA_TOKEN_UI_COMPONENT_NAV,
  AFENDA_TOKEN_UI_NAME_PREFIXES,
  assessAfendaTokenUiNaming,
  getAfendaTokenUiNavEntry,
  mapDtcgTypeToDisplayComponent,
  validateAfendaTokenCatalogNaming,
} from "../../contracts/afenda/token-ui.contract";

export type AfendaTokenUiRangeAssessment = {
  readonly apcaInRange: boolean | null;
  readonly apcaLc: number | null;
  readonly apcaLevel: ApcaContrastLevel | null;
  readonly apcaTarget: number | null;
  readonly displayComponent: AfendaTokenUiDisplayComponent;
  readonly dtcgType: AfendaTokenizedTokenType;
  readonly expectedPrefix: string;
  readonly inRange: boolean;
  readonly namingInRange: boolean;
};

function apcaTargetForColorPair(
  backgroundName: string
): keyof typeof AFENDA_APCA_CONTRAST_TARGETS {
  if (
    backgroundName === "color-background" ||
    backgroundName === "color-card" ||
    backgroundName === "color-popover" ||
    backgroundName.startsWith("color-surface")
  ) {
    return "criticalText";
  }

  return "standardUiText";
}

function tryCalcApcaLc(foreground: string, background: string): number | null {
  try {
    return calcApcaLc(foreground, background);
  } catch {
    return null;
  }
}

function resolveColorApcaPair(
  token: AfendaRuntimeToken,
  tokenMap: Readonly<Record<string, AfendaRuntimeToken>>
): {
  readonly background: AfendaRuntimeToken;
  readonly foreground: AfendaRuntimeToken;
  readonly target: keyof typeof AFENDA_APCA_CONTRAST_TARGETS;
} | null {
  if (token.displayComponent !== "ColorToken") {
    return null;
  }

  if (token.name.endsWith("-foreground")) {
    const backgroundName = token.name.replace(/-foreground$/, "");
    const background = tokenMap[backgroundName];
    if (!background) {
      return null;
    }

    return {
      background,
      foreground: token,
      target: apcaTargetForColorPair(backgroundName),
    };
  }

  const foreground = tokenMap[`${token.name}-foreground`];
  if (!foreground) {
    return null;
  }

  return {
    background: token,
    foreground,
    target: apcaTargetForColorPair(token.name),
  };
}

export function assessAfendaTokenUiRange(
  token: AfendaRuntimeToken,
  tokenMap: Readonly<Record<string, AfendaRuntimeToken>>,
  cssVars: CssVarMap
): AfendaTokenUiRangeAssessment {
  const navEntry = getAfendaTokenUiNavEntry(token.displayComponent);
  const naming = assessAfendaTokenUiNaming(token);
  const colorPair = resolveColorApcaPair(token, tokenMap);

  if (!colorPair) {
    return {
      ...naming,
      displayComponent: token.displayComponent,
      dtcgType: navEntry.dtcgType,
      apcaInRange: null,
      apcaLc: null,
      apcaLevel: null,
      apcaTarget: null,
      inRange: naming.namingInRange,
    };
  }

  const apcaLc = tryCalcApcaLc(
    resolveCssVarChain(String(colorPair.foreground.resolvedValue), cssVars),
    resolveCssVarChain(String(colorPair.background.resolvedValue), cssVars)
  );

  if (apcaLc === null) {
    return {
      ...naming,
      displayComponent: token.displayComponent,
      dtcgType: navEntry.dtcgType,
      apcaInRange: null,
      apcaLc: null,
      apcaLevel: null,
      apcaTarget: AFENDA_APCA_CONTRAST_TARGETS[colorPair.target],
      inRange: naming.namingInRange,
    };
  }

  const apcaTarget = AFENDA_APCA_CONTRAST_TARGETS[colorPair.target];
  const apcaInRange = apcaLc >= apcaTarget;

  return {
    ...naming,
    displayComponent: token.displayComponent,
    dtcgType: navEntry.dtcgType,
    apcaInRange,
    apcaLc,
    apcaLevel:
      apcaLc >= AFENDA_APCA_CONTRAST_TARGETS.criticalText
        ? "AAA"
        : apcaLc >= AFENDA_APCA_CONTRAST_TARGETS.standardUiText
          ? "AA"
          : "fail",
    apcaTarget,
    inRange: naming.namingInRange && apcaInRange,
  };
}

export type AfendaTokenUiComponentGroup = {
  readonly component: AfendaTokenUiDisplayComponent;
  readonly description: string;
  readonly dtcgType: AfendaTokenizedTokenType;
  readonly outOfRangeCount: number;
  readonly title: string;
  readonly tokens: readonly (AfendaRuntimeToken & {
    readonly range: AfendaTokenUiRangeAssessment;
  })[];
};

export function groupAfendaRuntimeTokensByDisplayComponent(
  snapshot: Pick<AfendaRuntimeTokenSnapshot, "cssVars" | "tokenMap" | "tokens">
): readonly AfendaTokenUiComponentGroup[] {
  return AFENDA_TOKEN_UI_COMPONENT_NAV.map((entry) => {
    const tokens = snapshot.tokens
      .filter((token) => token.displayComponent === entry.component)
      .map((token) => ({
        ...token,
        range: assessAfendaTokenUiRange(
          token,
          snapshot.tokenMap,
          snapshot.cssVars
        ),
      }));

    return {
      component: entry.component,
      title: entry.title,
      description: entry.description,
      dtcgType: entry.dtcgType,
      tokens,
      outOfRangeCount: tokens.filter((token) => !token.range.inRange).length,
    };
  });
}
