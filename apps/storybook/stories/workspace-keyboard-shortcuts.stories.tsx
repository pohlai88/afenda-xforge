import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { expect, userEvent, within } from "storybook/test";
import { KeyboardShortcutsDialog } from "../../app/app/_components/workspace/keyboard-shortcuts/keyboard-shortcuts-dialog.tsx";
import { ShortcutCapturePopover } from "../../app/app/_components/workspace/keyboard-shortcuts/shortcut-capture-popover.tsx";
import { ShortcutKeyDisplay } from "../../app/app/_components/workspace/keyboard-shortcuts/shortcut-key-display.tsx";
import {
  ShortcutFnKeyBadge,
  ShortcutMetaBadgeGroup,
  ShortcutReliabilityBadge,
  ShortcutSourceBadge,
} from "../../app/app/_components/workspace/keyboard-shortcuts/shortcut-meta-badges.tsx";
import { useWorkspaceShortcuts } from "../../app/app/_components/workspace/keyboard-shortcuts/use-keyboard-shortcuts.tsx";
import { KeyboardShortcutsAdminView } from "../../app/app/[locale]/(authenticated)/admin/keyboard-shortcuts/keyboard-shortcuts-admin-view.tsx";
import type { ResolvedShortcut } from "../../app/lib/workspace-shortcuts/contract.ts";
import { resolveProductDefaults } from "../../app/lib/workspace-shortcuts/resolve-shortcuts.ts";

import {
  createTenantPolicyFixture,
  withWorkspaceShortcutsIntl,
  withWorkspaceShortcutsShell,
} from "./workspace-keyboard-shortcuts-decorator.tsx";

const defaultPayload = resolveProductDefaults();
const sampleShortcut = defaultPayload.bindings["workspace.openShortcutHelp"];

const badgeFixtures: ResolvedShortcut[] = [
  {
    ...sampleShortcut,
    locked: false,
    source: "product",
  },
  {
    ...sampleShortcut,
    actionId: "crud.edit",
    locked: false,
    source: "tenant",
  },
  {
    ...sampleShortcut,
    actionId: "crud.save",
    locked: false,
    source: "user",
  },
  {
    ...sampleShortcut,
    actionId: "crud.delete",
    locked: true,
    source: "tenant",
  },
  {
    ...sampleShortcut,
    actionId: "workspace.commandSearch",
    browserConflict: true,
    locked: true,
    reliability: "low",
    source: "product",
  },
];

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
    <ShortcutMetaBadgeGroup>
      <ShortcutSourceBadge shortcut={sampleShortcut} />
      <ShortcutFnKeyBadge normalized="f1" />
      <ShortcutReliabilityBadge shortcut={sampleShortcut} />
    </ShortcutMetaBadgeGroup>
  ),
};

export const BadgeMatrix: Story = {
  decorators: [withWorkspaceShortcutsIntl],
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-col gap-4">
      {badgeFixtures.map((shortcut) => (
        <ShortcutMetaBadgeGroup key={shortcut.actionId}>
          <ShortcutSourceBadge shortcut={shortcut} />
          <ShortcutFnKeyBadge normalized={shortcut.binding.normalized} />
          <ShortcutReliabilityBadge shortcut={shortcut} />
        </ShortcutMetaBadgeGroup>
      ))}
    </div>
  ),
};

export const KeyCaps: Story = {
  decorators: [withWorkspaceShortcutsIntl],
  parameters: { layout: "centered" },
  render: () => (
    <div className="flex flex-col gap-4">
      <ShortcutKeyDisplay normalized="mod+k" />
      <ShortcutKeyDisplay normalized="f1" secondaryNormalized="mod+/" />
      <ShortcutKeyDisplay normalized="f2" />
    </div>
  ),
};

function OpenHelpDialogStory() {
  const { helpOpen, setHelpOpen } = useWorkspaceShortcuts();

  useEffect(() => {
    setHelpOpen(true);
  }, [setHelpOpen]);

  return (
    <KeyboardShortcutsDialog onOpenChange={setHelpOpen} open={helpOpen} />
  );
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

export const CapturePopoverReservedKey: Story = {
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: /press keys/i }));
    await userEvent.keyboard("{F5}");

    await expect(
      body.getByText(/reserved by the browser/i)
    ).toBeVisible();
  },
};

function PolicyDisabledHelpStory() {
  const { helpOpen, setHelpOpen } = useWorkspaceShortcuts();

  useEffect(() => {
    setHelpOpen(true);
  }, [setHelpOpen]);

  return (
    <KeyboardShortcutsDialog onOpenChange={setHelpOpen} open={helpOpen} />
  );
}

export const HelpDialogPolicyDisabled: Story = {
  decorators: [withWorkspaceShortcutsIntl],
  parameters: {
    layout: "centered",
    shortcutsPayload: {
      ...defaultPayload,
      policy: {
        ...defaultPayload.policy,
        allowUserCustomize: false,
      },
    },
  },
  render: () => <PolicyDisabledHelpStory />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await expect(
      body.getByText(/personal customization is disabled by your organization/i)
    ).toBeVisible();
  },
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
