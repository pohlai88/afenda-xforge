"use client";

import type * as ReactTypes from "react";
import * as React from "react";

import {
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  Breadcrumb as BreadcrumbRoot,
  BreadcrumbSeparator,
} from "../../ui-shadcn/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";

const BreadcrumbNavLabelContext = React.createContext<string>(
  "Breadcrumb navigation",
);

function Breadcrumb({
  "aria-label": ariaLabel,
  ...props
}: ReactTypes.ComponentProps<typeof BreadcrumbRoot>) {
  const contextLabel = React.useContext(BreadcrumbNavLabelContext);

  return <BreadcrumbRoot aria-label={ariaLabel ?? contextLabel} {...props} />;
}

function BreadcrumbPatternCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <BreadcrumbNavLabelContext.Provider value={title}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </BreadcrumbNavLabelContext.Provider>
  );
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbPatternCard,
  BreadcrumbSeparator,
};
