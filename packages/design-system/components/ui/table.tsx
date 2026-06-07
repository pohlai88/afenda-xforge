import type { ComponentProps, ReactElement } from "react";

import { cn } from "#lib/utils";

function Table({ className, ...props }: ComponentProps<"table">): ReactElement {
  return (
    <table
      className={cn("w-full caption-bottom text-sm", className)}
      data-slot="table"
      {...props}
    />
  );
}

function TableHeader({
  className,
  ...props
}: ComponentProps<"thead">): ReactElement {
  return (
    <thead
      className={cn("[&_tr]:border-border [&_tr]:border-b", className)}
      data-slot="table-header"
      {...props}
    />
  );
}

function TableBody({
  className,
  ...props
}: ComponentProps<"tbody">): ReactElement {
  return (
    <tbody
      className={cn("[&_tr:last-child]:border-0", className)}
      data-slot="table-body"
      {...props}
    />
  );
}

function TableFooter({
  className,
  ...props
}: ComponentProps<"tfoot">): ReactElement {
  return (
    <tfoot
      className={cn(
        "border-border border-t bg-muted/40 font-medium [&>tr]:last:border-b-0",
        className
      )}
      data-slot="table-footer"
      {...props}
    />
  );
}

function TableRow({ className, ...props }: ComponentProps<"tr">): ReactElement {
  return (
    <tr
      className={cn(
        "border-border border-b transition-colors hover:bg-muted/20 data-[state=selected]:bg-muted/30",
        className
      )}
      data-slot="table-row"
      {...props}
    />
  );
}

function TableHead({
  className,
  ...props
}: ComponentProps<"th">): ReactElement {
  return (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      data-slot="table-head"
      {...props}
    />
  );
}

function TableCell({
  className,
  ...props
}: ComponentProps<"td">): ReactElement {
  return (
    <td
      className={cn(
        "px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0",
        className
      )}
      data-slot="table-cell"
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: ComponentProps<"caption">): ReactElement {
  return (
    <caption
      className={cn("mt-4 text-muted-foreground text-sm", className)}
      data-slot="table-caption"
      {...props}
    />
  );
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
