import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { resolveProductDefaults } from "../lib/workspace-shortcuts/resolve-shortcuts.ts";

const mockOpenHelp = vi.fn();
const mockSetCommandOpen = vi.fn();
const mockDispatchCrudAction = vi.fn();
const mockToggleSidebar = vi.fn();
const mockRouterPush = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

vi.mock("@repo/ui/components/ui/sidebar", () => ({
  useSidebar: () => ({
    toggleSidebar: mockToggleSidebar,
  }),
}));

vi.mock(
  "../app/_components/workspace/keyboard-shortcuts/use-keyboard-shortcuts.tsx",
  () => ({
    useWorkspaceShortcuts: () => ({
      captureSuspended: false,
      commandOpen: false,
      deleteConfirmOpen: false,
      getFocusedTarget: () => null,
      helpOpen: false,
      openHelp: mockOpenHelp,
      payload: resolveProductDefaults(),
      setCommandOpen: mockSetCommandOpen,
      setHelpOpen: vi.fn(),
    }),
  })
);

vi.mock(
  "../app/_components/workspace/keyboard-shortcuts/use-shortcut-crud-dispatch.ts",
  () => ({
    useShortcutCrudDispatch: () => ({
      cancelPendingDelete: vi.fn(),
      confirmPendingDelete: vi.fn(),
      deleteConfirmOpen: false,
      dispatchCrudAction: mockDispatchCrudAction,
      setDeleteConfirmOpen: vi.fn(),
    }),
  })
);

vi.mock(
  "../app/_components/workspace/keyboard-shortcuts/keyboard-shortcuts-dialog.tsx",
  () => ({
    KeyboardShortcutsDialog: () => null,
  })
);

vi.mock(
  "../app/_components/workspace/keyboard-shortcuts/workspace-command-palette.tsx",
  () => ({
    WorkspaceCommandPalette: () => null,
  })
);

vi.mock(
  "../app/_components/workspace/keyboard-shortcuts/shortcut-delete-confirm-dialog.tsx",
  () => ({
    ShortcutDeleteConfirmDialog: () => null,
  })
);

import { WorkspaceShortcutsHost } from "../app/_components/workspace/keyboard-shortcuts/keyboard-shortcuts-provider.tsx";

describe("WorkspaceShortcutsHost", () => {
  it("opens shortcut help when the help binding is pressed", () => {
    mockOpenHelp.mockClear();

    render(<WorkspaceShortcutsHost />);

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        code: "F1",
        key: "F1",
      })
    );

    expect(mockOpenHelp).toHaveBeenCalledTimes(1);
  });

  it("opens command search instead of navigating when the Lynx scaffold binding is pressed", () => {
    mockRouterPush.mockClear();
    mockSetCommandOpen.mockClear();

    render(<WorkspaceShortcutsHost />);

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        code: "KeyL",
        ctrlKey: true,
        key: "l",
      })
    );

    expect(mockRouterPush).not.toHaveBeenCalled();
    expect(mockSetCommandOpen).toHaveBeenCalledWith(true);
  });

  it("opens the command palette when the search binding is pressed", () => {
    mockSetCommandOpen.mockClear();

    render(<WorkspaceShortcutsHost />);

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        code: "KeyK",
        ctrlKey: true,
        key: "k",
      })
    );

    expect(mockSetCommandOpen).toHaveBeenCalledWith(true);
  });
});
