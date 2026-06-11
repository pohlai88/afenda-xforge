import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { KeyboardShortcutsAdminView } from "../app/[locale]/(authenticated)/admin/keyboard-shortcuts/keyboard-shortcuts-admin-view.tsx";
import type { TenantKeyboardShortcutPolicyPayload } from "../lib/workspace-shortcuts/contract.ts";
import { resolveProductDefaults } from "../lib/workspace-shortcuts/resolve-shortcuts.ts";
import enMessages from "../messages/en.json";

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock(
  "../app/_components/workspace/keyboard-shortcuts/shortcut-capture-popover.tsx",
  () => ({
    ShortcutCapturePopover: () => null,
  })
);

function IntlWrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      {children}
    </NextIntlClientProvider>
  );
}

function createFixture(): TenantKeyboardShortcutPolicyPayload {
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

describe("KeyboardShortcutsAdminView", () => {
  it("renders tenant customization policy controls", () => {
    render(
      <IntlWrapper>
        <KeyboardShortcutsAdminView canWrite initialPayload={createFixture()} />
      </IntlWrapper>
    );

    expect(
      screen.getByRole("heading", { name: /keyboard shortcuts/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/customization policy/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/allow user customization/i)
    ).toBeInTheDocument();
  });

  it("shows read-only guidance when writes are disabled", () => {
    render(
      <IntlWrapper>
        <KeyboardShortcutsAdminView
          canWrite={false}
          initialPayload={createFixture()}
        />
      </IntlWrapper>
    );

    expect(
      screen.getByText(/read-only access to tenant keyboard shortcut policy/i)
    ).toBeInTheDocument();
  });
});
