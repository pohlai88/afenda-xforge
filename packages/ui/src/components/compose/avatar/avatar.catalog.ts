import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { AvatarBasic } from "./avatar-basic";
import { AvatarBasicGroup } from "./avatar-basic-group";
import { AvatarOnlineStatusBadge } from "./avatar-online-status-badge";
import { AvatarUserDetailsAndBadge } from "./avatar-user-details-and-badge";

export type AvatarCatalogPatternSpec = ComposeRenderablePatternSpec;

export const avatarPatternCatalog = [
  {
    name: "basic",
    title: "Basic",
    description: "A basic user avatar.",
    component: AvatarBasic,
  },
  {
    name: "basic-group",
    title: "Basic Group",
    description: "A compact group of avatars.",
    component: AvatarBasicGroup,
  },
  {
    name: "online-status",
    title: "Online Status",
    description: "Avatar with presence indicator.",
    component: AvatarOnlineStatusBadge,
  },
  {
    name: "user-details-badge",
    title: "User Details Badge",
    description: "Identity summary with status metadata.",
    component: AvatarUserDetailsAndBadge,
  },
] as const satisfies readonly AvatarCatalogPatternSpec[];

export type AvatarCatalogPatternName =
  (typeof avatarPatternCatalog)[number]["name"];

export const avatarPatternCount = avatarPatternCatalog.length;
export const avatarPatternNames = avatarPatternCatalog.map(
  (pattern) => pattern.name,
) as AvatarCatalogPatternName[];
