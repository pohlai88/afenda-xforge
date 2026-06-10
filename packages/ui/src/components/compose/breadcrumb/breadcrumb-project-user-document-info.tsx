"use client";

import { FileText, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../../ui-shadcn/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbPatternCard,
  BreadcrumbSeparator,
} from "./breadcrumb.shared";

export function BreadcrumbProjectUserDocumentInfo() {
  return (
    <BreadcrumbPatternCard title="Breadcrumb with project, user and document info">
      <div className="rounded-xl border border-dashed p-3">
        <Breadcrumb>
          <BreadcrumbList className="gap-3">
            <BreadcrumbItem>
              <BreadcrumbLink href="#" className="flex items-center gap-2">
                <Avatar aria-hidden="true" className="size-6">
                  <AvatarImage alt="" src="https://github.com/vercel.png" />
                  <AvatarFallback>VC</AvatarFallback>
                </Avatar>
                Vercel
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/60">
              /
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="#" className="flex items-center gap-3">
                <Avatar aria-hidden="true" className="size-6">
                  <AvatarImage alt="" src="https://github.com/shadcn.png" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <span className="flex flex-col">
                  <span className="flex items-center gap-1.5 font-medium text-foreground leading-tight">
                    <UserRound className="size-3.5" />
                    shadcn
                  </span>
                  <span className="leading-tight text-muted-foreground">
                    ui@shadcn.com
                  </span>
                </span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground/60">
              /
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-md bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
                  <FileText className="size-3.5" />
                </span>
                <span className="flex flex-col">
                  <span className="font-medium leading-tight text-foreground">
                    Document
                  </span>
                  <span className="leading-tight text-muted-foreground">
                    agents.md
                  </span>
                </span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </BreadcrumbPatternCard>
  );
}
