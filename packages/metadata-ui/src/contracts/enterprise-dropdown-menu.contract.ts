import type { ReactNode } from "react";

export type EnterpriseDropdownMenuAlign = "center" | "end" | "start";

export type EnterpriseDropdownMenuItem = {
  destructive?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  key: string;
  label: string;
  onSelect?: () => void;
  shortcut?: string;
};

export type EnterpriseDropdownMenuGroup = {
  items: readonly EnterpriseDropdownMenuItem[];
  key: string;
  label?: string;
};

export type EnterpriseDropdownMenuIdentityHeader = {
  avatarFallback?: string;
  avatarUrl?: string | null;
  subtitle?: string;
  title: string;
};

export type EnterpriseDropdownMenuHeader =
  | EnterpriseDropdownMenuIdentityHeader
  | ReactNode;

export type EnterpriseDropdownMenuProps = {
  align?: EnterpriseDropdownMenuAlign;
  contentClassName?: string;
  footerItems?: readonly EnterpriseDropdownMenuItem[];
  groups?: readonly EnterpriseDropdownMenuGroup[];
  header?: EnterpriseDropdownMenuHeader;
  items?: readonly EnterpriseDropdownMenuItem[];
  sideOffset?: number;
  trigger: ReactNode;
};
