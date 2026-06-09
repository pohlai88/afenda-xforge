"use client";

import type { Country } from "react-phone-number-input";
import PhoneInputPrimitive, {
  isValidPhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import type * as React from "react";

import { cn } from "../../../lib/utils";
import { Badge } from "../../ui-shadcn/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";

type PhoneInputVariant = "sm" | "default" | "lg";

function variantClasses(variant: PhoneInputVariant) {
  switch (variant) {
    case "sm":
      return "max-w-xs";
    case "lg":
      return "max-w-md";
    default:
      return "max-w-sm";
  }
}

function PhoneInput({
  className,
  popupClassName,
  variant = "default",
  countrySelectProps,
  ...props
}: React.ComponentProps<typeof PhoneInputPrimitive> & {
  variant?: PhoneInputVariant;
  popupClassName?: string;
}) {
  return (
    <PhoneInputPrimitive
      data-slot="phone-input"
      className={cn("w-full", variantClasses(variant), className)}
      countrySelectProps={{
        ...(countrySelectProps as Record<string, unknown> | undefined),
        className: cn(
          "PhoneInputCountrySelect",
          popupClassName,
          (countrySelectProps as { className?: string } | undefined)?.className,
        ),
      }}
      {...props}
    />
  );
}

function PhoneInputPatternCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export type { Country, PhoneInputVariant };
export { Badge, isValidPhoneNumber, PhoneInput, PhoneInputPatternCard };
