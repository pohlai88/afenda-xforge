import { DEFAULT_TENANT_BRANDING_SETTINGS } from "@repo/design-system";
import type { Decorator } from "@storybook/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { WorkspaceShortcutsRoot } from "../../app/app/_components/workspace-shortcuts-root.tsx";
import { ThemeStudioPreviewRoot } from "../../app/app/[locale]/theme-studio/_components/theme-studio-preview-root.tsx";
import { ThemeStudioWorkspace } from "../../app/app/[locale]/theme-studio/_components/theme-studio-workspace.tsx";
import type {
  TenantKeyboardShortcutPolicyPayload,
  WorkspaceShortcutsPayload,
} from "../../app/app/lib/workspace-shortcuts/contract.ts";
import { resolveProductDefaults } from "../../app/app/lib/workspace-shortcuts/resolve-shortcuts.ts";
import enMessages from "../../app/messages/en.json";

export function WorkspaceShortcutsStoryRoot({
  children,
  payload = resolveProductDefaults(),
}: {
  children: ReactNode;
  payload?: WorkspaceShortcutsPayload;
}): ReactNode {
  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      <WorkspaceShortcutsRoot payload={payload}>
        {children}
      </WorkspaceShortcutsRoot>
    </NextIntlClientProvider>
  );
}

export const withWorkspaceShortcutsIntl: Decorator = (Story, context) => {
  const payload =
    (context.parameters.shortcutsPayload as
      | WorkspaceShortcutsPayload
      | undefined) ?? resolveProductDefaults();

  return (
    <WorkspaceShortcutsStoryRoot payload={payload}>
      <Story />
    </WorkspaceShortcutsStoryRoot>
  );
};

export const withWorkspaceShortcutsShell: Decorator = (Story) => (
  <NextIntlClientProvider locale="en" messages={enMessages}>
    <ThemeStudioPreviewRoot branding={DEFAULT_TENANT_BRANDING_SETTINGS}>
      <ThemeStudioWorkspace>
        <Story />
      </ThemeStudioWorkspace>
    </ThemeStudioPreviewRoot>
  </NextIntlClientProvider>
);

export function createTenantPolicyFixture(): TenantKeyboardShortcutPolicyPayload {
  const preview = resolveProductDefaults();

  return {
    policy: {
      allowFnKeyBindings: preview.policy.allowFnKeyBindings,
      allowUserCustomize: preview.policy.allowUserCustomize,
      lockedActions: preview.policy.lockedActions,
      overrides: {},
    },
    preview,
  };
}
