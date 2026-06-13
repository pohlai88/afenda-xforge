"use client";

import type {
  AfendaRuntimeToken,
  AfendaTokenUiDisplayToken,
} from "@repo/design-system/css/tokens";
import type { ReactElement } from "react";

import { ColorToken } from "./color-token";
import { DurationToken } from "./duration-token";
import { ElevationToken } from "./elevation-token";
import { FontFamilyToken } from "./font-family-token";
import { FontWeightToken } from "./font-weight-token";
import { NumberToken } from "./number-token";
import { OrderToken } from "./order-token";
import { RadiusToken } from "./radius-token";
import { SpacingToken } from "./spacing-token";
import { TypographyToken } from "./typography-token";

type AfendaRenderableToken = AfendaTokenUiDisplayToken | AfendaRuntimeToken;

type AfendaTokenDisplayProps = {
  token: AfendaRenderableToken;
};

function formatTokenValue(token: AfendaRenderableToken): string {
  if ("resolvedValue" in token) {
    return String(token.resolvedValue);
  }

  return String(token.value);
}

function AfendaTokenDisplay({ token }: AfendaTokenDisplayProps): ReactElement {
  const displayProps = {
    name: token.name,
    value: formatTokenValue(token),
  };

  switch (token.displayComponent) {
    case "ColorToken":
      return <ColorToken {...displayProps} />;
    case "TypographyToken":
      return <TypographyToken {...displayProps} />;
    case "SpacingToken":
      return <SpacingToken {...displayProps} />;
    case "RadiusToken":
      return <RadiusToken {...displayProps} />;
    case "ElevationToken":
      return <ElevationToken {...displayProps} />;
    case "DurationToken":
      return <DurationToken {...displayProps} />;
    case "FontFamilyToken":
      return <FontFamilyToken {...displayProps} />;
    case "FontWeightToken":
      return <FontWeightToken {...displayProps} />;
    case "NumberToken":
      return <NumberToken {...displayProps} />;
    case "OrderToken":
      return <OrderToken {...displayProps} />;
    default: {
      const _exhaustive: never = token.displayComponent;
      throw new Error(`Unsupported Token UI display: ${String(_exhaustive)}`);
    }
  }
}

export { AfendaTokenDisplay, type AfendaTokenDisplayProps };
