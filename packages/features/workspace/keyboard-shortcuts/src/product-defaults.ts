import type {
  ProductShortcutDefinition,
  ShortcutActionId,
  ShortcutBinding,
} from "./contract.ts";
import { formatShortcutLabel } from "./format-shortcut.ts";

const binding = (normalized: string): ShortcutBinding => ({
  key: normalized,
  normalized,
  label: formatShortcutLabel(normalized),
});

export const PRODUCT_SHORTCUT_DEFINITIONS: readonly ProductShortcutDefinition[] =
  [
    {
      actionId: "workspace.commandSearch",
      defaultBinding: binding("mod+k"),
      group: "navigation",
      scope: "global",
      locked: true,
      description: "Open command palette",
      reliability: "high",
    },
    {
      actionId: "workspace.openShortcutHelp",
      defaultBinding: binding("f1"),
      secondaryBinding: binding("mod+/"),
      group: "help",
      scope: "global",
      locked: false,
      description: "Open keyboard shortcuts help",
      reliability: "low",
      browserConflict: true,
    },
    {
      actionId: "crud.edit",
      defaultBinding: binding("f2"),
      group: "crud",
      scope: "crud",
      locked: false,
      description: "Edit focused record",
      reliability: "high",
    },
    {
      actionId: "crud.save",
      defaultBinding: binding("f3"),
      group: "crud",
      scope: "crud",
      locked: false,
      description: "Save current draft",
      reliability: "high",
    },
    {
      actionId: "crud.create",
      defaultBinding: binding("f4"),
      group: "crud",
      scope: "crud",
      locked: false,
      description: "Create new record",
      reliability: "high",
    },
    {
      actionId: "crud.delete",
      defaultBinding: binding("f8"),
      group: "crud",
      scope: "crud",
      locked: false,
      description: "Delete focused record",
      reliability: "high",
    },
    {
      actionId: "crud.cancel",
      defaultBinding: binding("escape"),
      group: "crud",
      scope: "crud",
      locked: false,
      description: "Cancel edit",
      reliability: "high",
    },
    {
      actionId: "workspace.toggleSidebar",
      defaultBinding: binding("mod+b"),
      group: "navigation",
      scope: "workspace",
      locked: false,
      description: "Toggle sidebar",
      reliability: "high",
    },
  ] as const;

export const PRODUCT_LOCKED_ACTIONS: readonly ShortcutActionId[] =
  PRODUCT_SHORTCUT_DEFINITIONS.filter((entry) => entry.locked).map(
    (entry) => entry.actionId
  );

export const getProductShortcutDefinition = (
  actionId: ShortcutActionId
): ProductShortcutDefinition | undefined =>
  PRODUCT_SHORTCUT_DEFINITIONS.find((entry) => entry.actionId === actionId);
