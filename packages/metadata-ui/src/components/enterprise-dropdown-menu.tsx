"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import type { ReactElement, ReactNode } from "react";

import type {
  EnterpriseDropdownMenuHeader,
  EnterpriseDropdownMenuIdentityHeader,
  EnterpriseDropdownMenuItem,
  EnterpriseDropdownMenuProps,
} from "../contracts/enterprise-dropdown-menu.contract";
import {
  ENTERPRISE_DROPDOWN_AVATAR_CLASS,
  ENTERPRISE_DROPDOWN_CONTENT_CLASS,
  ENTERPRISE_DROPDOWN_GROUP_LABEL_CLASS,
  ENTERPRISE_DROPDOWN_IDENTITY_HEADER_CLASS,
  ENTERPRISE_DROPDOWN_IDENTITY_SUBTITLE_CLASS,
  ENTERPRISE_DROPDOWN_IDENTITY_TITLE_CLASS,
  ENTERPRISE_DROPDOWN_SHORTCUT_CLASS,
} from "../visualization/enterprise-dropdown-visual-contract";

function isIdentityHeader(
  header: EnterpriseDropdownMenuHeader
): header is EnterpriseDropdownMenuIdentityHeader {
  return (
    typeof header === "object" &&
    header !== null &&
    "title" in header &&
    typeof (header as EnterpriseDropdownMenuIdentityHeader).title === "string"
  );
}

function renderIdentityHeader(
  header: EnterpriseDropdownMenuIdentityHeader
): ReactElement {
  const fallback =
    header.avatarFallback ?? header.title.slice(0, 2).toUpperCase();

  return (
    <DropdownMenuLabel className="p-0 font-normal">
      <div className={ENTERPRISE_DROPDOWN_IDENTITY_HEADER_CLASS}>
        <Avatar className={ENTERPRISE_DROPDOWN_AVATAR_CLASS}>
          <AvatarImage alt={header.title} src={header.avatarUrl ?? undefined} />
          <AvatarFallback className="rounded-md">{fallback}</AvatarFallback>
        </Avatar>
        <div className="grid min-w-0 flex-1 text-left leading-tight">
          <span className={ENTERPRISE_DROPDOWN_IDENTITY_TITLE_CLASS}>
            {header.title}
          </span>
          {header.subtitle ? (
            <span className={ENTERPRISE_DROPDOWN_IDENTITY_SUBTITLE_CLASS}>
              {header.subtitle}
            </span>
          ) : null}
        </div>
      </div>
    </DropdownMenuLabel>
  );
}

function renderMenuItem(item: EnterpriseDropdownMenuItem): ReactElement {
  return (
    <DropdownMenuItem
      disabled={item.disabled}
      key={item.key}
      onSelect={(event) => {
        if (!item.onSelect) {
          return;
        }

        event.preventDefault();
        item.onSelect();
      }}
      variant={item.destructive ? "destructive" : "default"}
    >
      {item.icon}
      <span className="truncate">{item.label}</span>
      {item.shortcut ? (
        <DropdownMenuShortcut className={ENTERPRISE_DROPDOWN_SHORTCUT_CLASS}>
          {item.shortcut}
        </DropdownMenuShortcut>
      ) : null}
    </DropdownMenuItem>
  );
}

function renderItemSections({
  footerItems,
  groups,
  items,
}: Pick<
  EnterpriseDropdownMenuProps,
  "footerItems" | "groups" | "items"
>): ReactNode {
  const hasGroups = groups && groups.length > 0;
  const hasFlatItems = items && items.length > 0;
  const hasFooter = footerItems && footerItems.length > 0;

  if (!(hasGroups || hasFlatItems || hasFooter)) {
    return null;
  }

  return (
    <>
      {hasGroups
        ? groups.map((group, groupIndex) => (
            <div key={group.key}>
              {groupIndex > 0 || hasFlatItems ? (
                <DropdownMenuSeparator />
              ) : null}
              {group.label ? (
                <DropdownMenuLabel
                  className={ENTERPRISE_DROPDOWN_GROUP_LABEL_CLASS}
                >
                  {group.label}
                </DropdownMenuLabel>
              ) : null}
              <DropdownMenuGroup>
                {group.items.map((item) => renderMenuItem(item))}
              </DropdownMenuGroup>
            </div>
          ))
        : null}
      {hasFlatItems ? (
        <>
          {hasGroups ? <DropdownMenuSeparator /> : null}
          <DropdownMenuGroup>
            {items.map((item) => renderMenuItem(item))}
          </DropdownMenuGroup>
        </>
      ) : null}
      {hasFooter ? (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {footerItems.map((item) => renderMenuItem(item))}
          </DropdownMenuGroup>
        </>
      ) : null}
    </>
  );
}

function resolveDropdownHeader(
  header: EnterpriseDropdownMenuProps["header"]
): ReactNode {
  if (!header) {
    return null;
  }

  if (isIdentityHeader(header)) {
    return renderIdentityHeader(header);
  }

  return header;
}

export function EnterpriseDropdownMenu({
  align = "end",
  contentClassName,
  footerItems,
  groups,
  header,
  items,
  sideOffset = 4,
  trigger,
}: EnterpriseDropdownMenuProps): ReactElement {
  const headerNode = resolveDropdownHeader(header);

  const itemSections = renderItemSections({ footerItems, groups, items });
  const showHeaderSeparator = Boolean(headerNode && itemSections);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className={cn(ENTERPRISE_DROPDOWN_CONTENT_CLASS, contentClassName)}
        sideOffset={sideOffset}
      >
        {headerNode}
        {showHeaderSeparator ? <DropdownMenuSeparator /> : null}
        {itemSections}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
