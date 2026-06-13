"use client";

import type { HTMLAttributes } from "react";
import * as React from "react";

import { cn } from "../../lib/utils";
import {
  ColorSwatch,
  ColorSwatchLabel,
  ColorSwatchPart,
  type ColorSwatchLabelProps,
  type ColorSwatchPartProps,
  type ColorSwatchProps,
} from "./color-swatch";

type ColorPaletteLabelProps = HTMLAttributes<HTMLDivElement>;

const ColorPaletteLabel = React.forwardRef<
  HTMLDivElement,
  ColorPaletteLabelProps
>(({ className, children, ...props }, forwardedRef) => {
  return (
    <div
      ref={forwardedRef}
      className={cn("font-medium text-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
});

ColorPaletteLabel.displayName = "ColorPaletteLabel";

type ColorStop = {
  name?: string;
  value: string;
};

type ColorPaletteProps = {
  colors: string[] | ColorStop[];
  orientation?: "horizontal" | "vertical";
  label?: string;
  className?: string;
};

function ColorPalette({
  colors,
  orientation = "horizontal",
  label,
  className,
}: ColorPaletteProps) {
  const colorStops: ColorStop[] = colors.map((color) =>
    typeof color === "string" ? { value: color } : color,
  );

  const orientationClass =
    orientation === "vertical" ? "flex-col h-64" : "flex-row h-20";

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <ColorPaletteLabel>{label}</ColorPaletteLabel> : null}
      <div
        className={cn(
          "flex overflow-hidden rounded-md border",
          orientationClass,
        )}
      >
        {colorStops.map((stop, index) => (
          <ColorSwatch
            key={`${stop.name || stop.value}-${index}`}
            value={stop.value}
            name={stop.name}
            className="hover:flex-[1.08] hover:opacity-95"
          >
            <ColorSwatchLabel>{stop.name ?? stop.value}</ColorSwatchLabel>
          </ColorSwatch>
        ))}
      </div>
    </div>
  );
}

export {
  ColorPalette,
  ColorSwatch,
  ColorSwatchLabel,
  ColorSwatchPart,
  ColorPaletteLabel,
  type ColorPaletteProps,
  type ColorSwatchProps,
  type ColorSwatchLabelProps,
  type ColorSwatchPartProps,
  type ColorPaletteLabelProps,
  type ColorStop,
};
