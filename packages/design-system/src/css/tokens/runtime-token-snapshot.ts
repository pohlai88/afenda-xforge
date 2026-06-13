import type { AfendaTenantBrandingSettings as TenantBrandingSettings } from "../../contracts/afenda/customization/branding.contract";
import {
  AFENDA_DEFAULT_TENANT_BRANDING_SETTINGS as DEFAULT_TENANT_BRANDING_SETTINGS,
  validateAfendaTenantBrandingSettings as validateTenantBrandingSettings,
} from "../../contracts/afenda/customization/branding.contract";
import {
  type AfendaRuntimeTokenResolutionSource,
} from "../../contracts/afenda/token-ui.contract";
export type { AfendaRuntimeTokenResolutionSource } from "../../contracts/afenda/token-ui.contract";
import {
  resolveTenantBrandingModeCssVars,
  type CssVarMap,
} from "../../customise-branding/resolution";
import {
  AFENDA_TOKEN_UI_DISPLAY_COMPONENTS,
  afendaTokenCatalog,
  type AfendaTokenUiDisplayToken,
  type AfendaTokenizedToken,
} from "./token-catalog";

export type AfendaRuntimeToken = AfendaTokenUiDisplayToken & {
  readonly resolutionSource: AfendaRuntimeTokenResolutionSource;
  readonly resolvedValue: string | number;
  readonly resolvedVariable?: `--${string}`;
};

export type AfendaRuntimeTokenSnapshot = {
  readonly cssVars: CssVarMap;
  readonly mode: ColorMode;
  readonly settings: TenantBrandingSettings;
  readonly tokenMap: Readonly<Record<string, AfendaRuntimeToken>>;
  readonly tokens: readonly AfendaRuntimeToken[];
};

type ColorMode = "light" | "dark";

function extractVariableCandidates(
  token: AfendaTokenizedToken
): readonly `--${string}`[] {
  const candidates = new Set<`--${string}`>();

  if (token.cssVariable) {
    candidates.add(token.cssVariable);
  }

  for (const reference of token.references ?? []) {
    if (reference.startsWith("--")) {
      candidates.add(reference as `--${string}`);
    }
  }

  if (typeof token.value === "string") {
    const matches = token.value.matchAll(/var\(\s*(--[a-z0-9-]+)/gi);
    for (const match of matches) {
      candidates.add(match[1] as `--${string}`);
    }
  }

  return [...candidates];
}

function resolveRuntimeTokenValue(
  token: AfendaTokenizedToken,
  cssVars: CssVarMap
): Pick<
  AfendaRuntimeToken,
  "resolutionSource" | "resolvedValue" | "resolvedVariable"
> {
  const candidates = extractVariableCandidates(token);

  for (const candidate of candidates) {
    const resolvedValue = cssVars[candidate];
    if (!resolvedValue) {
      continue;
    }

    return {
      resolutionSource:
        token.cssVariable === candidate ? "css-variable" : "reference-variable",
      resolvedValue,
      resolvedVariable: candidate,
    };
  }

  return {
    resolutionSource: "literal",
    resolvedValue: token.value,
  };
}

function buildRuntimeToken(
  token: AfendaTokenizedToken,
  cssVars: CssVarMap
): AfendaRuntimeToken {
  return {
    ...token,
    displayComponent: AFENDA_TOKEN_UI_DISPLAY_COMPONENTS[token.type],
    ...resolveRuntimeTokenValue(token, cssVars),
  };
}

export function resolveAfendaRuntimeTokens(
  settings: TenantBrandingSettings = DEFAULT_TENANT_BRANDING_SETTINGS,
  mode: ColorMode = "light"
): readonly AfendaRuntimeToken[] {
  const parsedSettings = validateTenantBrandingSettings(settings);
  const cssVars = resolveTenantBrandingModeCssVars(parsedSettings, mode);

  return afendaTokenCatalog.map((token) => buildRuntimeToken(token, cssVars));
}

export function resolveAfendaRuntimeToken(
  tokenName: string,
  settings: TenantBrandingSettings = DEFAULT_TENANT_BRANDING_SETTINGS,
  mode: ColorMode = "light"
): AfendaRuntimeToken | undefined {
  return resolveAfendaRuntimeTokens(settings, mode).find(
    (token) => token.name === tokenName
  );
}

export function resolveAfendaRuntimeTokenSnapshot(
  settings: TenantBrandingSettings = DEFAULT_TENANT_BRANDING_SETTINGS,
  mode: ColorMode = "light"
): AfendaRuntimeTokenSnapshot {
  const parsedSettings = validateTenantBrandingSettings(settings);
  const cssVars = resolveTenantBrandingModeCssVars(parsedSettings, mode);
  const tokens = afendaTokenCatalog.map((token) => buildRuntimeToken(token, cssVars));

  return {
    cssVars,
    mode,
    settings: parsedSettings,
    tokenMap: Object.fromEntries(
      tokens.map((token) => [token.name, token])
    ) as Readonly<Record<string, AfendaRuntimeToken>>,
    tokens,
  };
}
