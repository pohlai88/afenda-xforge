"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbPatternCard,
  BreadcrumbSeparator,
} from "./breadcrumb.shared";

export function BreadcrumbPillStyleInsideFrame() {
  return (
    <BreadcrumbPatternCard title="Pill-style breadcrumb inside frame">
      <div className="rounded-xl border border-dashed p-3">
        <div className="rounded-full bg-muted/50 px-3 py-2">
          <Breadcrumb>
            <BreadcrumbList className="gap-1.5 sm:gap-1.5">
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    </BreadcrumbPatternCard>
  );
}
