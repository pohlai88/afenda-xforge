"use client";

import type * as React from "react";

import { cn } from "../../lib/utils";
import {
  TokenIndicator,
  TokenName,
  TokenProvider,
  TokenRoot,
  TokenValue,
  type TokenIndicatorProps,
  type TokenNameProps,
  type TokenProps,
} from "./token";

const COLOR_TOKEN_CHECKERBOARD_CLASS =
  "bg-[linear-gradient(45deg,hsl(var(--muted))_25%,transparent_25%,transparent_75%,hsl(var(--muted))_75%,hsl(var(--muted))),linear-gradient(45deg,hsl(var(--muted))_25%,transparent_25%,transparent_75%,hsl(var(--muted))_75%,hsl(var(--muted)))] bg-[length:12px_12px] bg-[position:0_0,6px_6px]";

type ColorTokenProps = TokenProps & {
  indicatorProps?: TokenIndicatorProps;
  nameProps?: TokenNameProps;
  showValuePreview?: boolean;
  swatchClassName?: string;
};

function ColorToken({
  indicatorProps,
  nameProps,
  showValuePreview = true,
  swatchClassName,
  name,
  value,
  children,
  ...props
}: ColorTokenProps) {
  const {
    className: indicatorClassName,
    children: indicatorChildren,
    ...restIndicatorProps
  } = indicatorProps ?? {};
  const {
    className: nameClassName,
    children: nameChildren,
    ...restNameProps
  } = nameProps ?? {};

  return (
    <TokenProvider name={name} value={value}>
      <TokenRoot {...props}>
        <TokenName
          className={cn("h-auto min-w-0 gap-3 px-2.5 py-2", nameClassName)}
          {...restNameProps}
        >
          <span
            aria-hidden
            className={cn(
              "inline-flex size-5 shrink-0 overflow-hidden rounded-md border border-border/70 shadow-sm",
              COLOR_TOKEN_CHECKERBOARD_CLASS,
              swatchClassName,
            )}
          >
            <TokenIndicator
              className={cn("size-full rounded-none", indicatorClassName)}
              {...restIndicatorProps}
            >
              {indicatorChildren}
            </TokenIndicator>
          </span>
          <span className="grid min-w-0 flex-1 text-left">
            <span className="truncate font-medium text-foreground text-sm">
              {name}
            </span>
            {showValuePreview ? (
              <span className="truncate font-mono text-[11px] text-muted-foreground">
                {value}
              </span>
            ) : null}
          </span>
          {nameChildren}
          {children}
        </TokenName>
        <TokenValue
          className={cn(
            "w-64 rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-lg",
          )}
          sideOffset={8}
        >
          <div className="overflow-hidden rounded-[inherit]">
            <div
              className={cn(
                "border-b border-border/70 p-3",
                COLOR_TOKEN_CHECKERBOARD_CLASS,
              )}
            >
              <div
                className="h-16 w-full rounded-lg border border-black/10 shadow-inner"
                style={{ backgroundColor: value }}
              />
            </div>
            <div className="space-y-1.5 p-3">
              <div className="font-medium text-sm text-foreground">{name}</div>
              <div className="break-all font-mono text-[11px] text-muted-foreground">
                {value}
              </div>
            </div>
          </div>
        </TokenValue>
      </TokenRoot>
    </TokenProvider>
  );
}

export { ColorToken, type ColorTokenProps };
