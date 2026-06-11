import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { expect, userEvent, within } from "storybook/test";
import { KeyboardShortcutsDialog } from "../../app/app/_components/workspace/keyboard-shortcuts/keyboard-shortcuts-dialog.tsx";
import { ShortcutCapturePopover } from "../../app/app/_components/workspace/keyboard-shortcuts/shortcut-capture-popover.tsx";
import {
  ShortcutBadgeGroup,
  ShortcutFnKeyBadge,
  ShortcutReliabilityBadge,
  ShortcutSourceBadge,
} from "../../app/app/_components/workspace/keyboard-shortcuts/shortcut-source-badge.tsx";
import { useWorkspaceShortcuts } from "../../app/app/_components/workspace/keyboard-shortcuts/use-keyboard-shortcuts.tsx";
import { KeyboardShortcutsAdminView } from "../../app/app/[locale]/(authenticated)/admin/keyboard-shortcuts/keyboard-shortcuts-admin-view.tsx";
import { resolveProductDefaults } from "../../app/app/lib/workspace-shortcuts/resolve-shortcuts.ts";

import {
  createTenantPolicyFixture,
  withWorkspaceShortcutsIntl,
  withWorkspaceShortcutsShell,
} from "./workspace-keyboard-shortcuts-decorator.tsx";

const defaultPayload = resolveProductDefaults();
const sampleShortcut = defaultPayload.bindings["workspace.openShortcutHelp"];

const meta = {
  title: "Workspace/Keyboard Shortcuts",
  parameters: {
    layout: "fullscreen",
    a11y: { test: "todo" as const },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const SourceBadges: Story = {
  decorators: [withWorkspaceShortcutsIntl],
  parameters: { layout: "centered" },
  render: () => (
    <ShortcutBadgeGroup>
      <ShortcutSourceBadge shortcut={sampleShortcut} />
      <ShortcutFnKeyBadge normalized="f1" />
      <ShortcutReliabilityBadge shortcut={sampleShortcut} />
    </ShortcutBadgeGroup>
  ),
};

function OpenHelpDialogStory() {
  const { setHelpOpen } = useWorkspaceShortcuts();

  useEffect(() => {
    setHelpOpen(true);
  }, [setHelpOpen]);

  return <KeyboardShortcutsDialog onOpenChange={setHelpOpen} open />;
}

export const HelpDialog: Story = {
  decorators: [withWorkspaceShortcutsIntl],
  parameters: { layout: "centered" },
  render: () => <OpenHelpDialogStory />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await expect(
      body.getByRole("dialog", { name: /keyboard shortcuts/i })
    ).toBeVisible();
  },
};

export const CapturePopover: Story = {
  decorators: [withWorkspaceShortcutsIntl],
  parameters: { layout: "centered" },
  render: () => (
    <ShortcutCapturePopover
      actionId="crud.save"
      actionLabel="Save current draft"
      allowFnKeyBindings
      onCapture={() => undefined}
      value="f3"
    />
  ),
};

export const AdminPolicyReadOnly: Story = {
  decorators: [withWorkspaceShortcutsIntl],
  parameters: { layout: "padded" },
  render: () => (
    <KeyboardShortcutsAdminView
      canWrite={false}
      initialPayload={createTenantPolicyFixture()}
    />
  ),
};

function ShortcutDemoSurface() {
  const { openCommand, openHelp } = useWorkspaceShortcuts();

  return (
    <div className="flex flex-col gap-4 p-8">
      <p className="text-muted-foreground text-sm">
        Press Ctrl+K for command palette, F1 or Ctrl+/ for help.
      </p>
      <button onClick={openCommand} type="button">
        Open command palette
      </button>
      <button onClick={openHelp} type="button">
        Open shortcut help
      </button>
    </div>
  );
}

export const FullShellInteractive: Story = {
  decorators: [withWorkspaceShortcutsShell],
  render: () => <ShortcutDemoSurface />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.keyboard("{Control>}k{/Control}");
    await expect(body.getByRole("dialog")).toBeVisible();
    await userEvent.keyboard("{Escape}");
  },
};
