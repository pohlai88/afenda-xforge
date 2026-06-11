import { act, renderHook } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import enMessages from "../messages/en.json";

const mockGetFocusedTarget = vi.fn();
const mockSetCaptureSuspended = vi.fn();

vi.mock(
  "../app/_components/workspace/keyboard-shortcuts/use-keyboard-shortcuts.tsx",
  () => ({
    useWorkspaceShortcuts: () => ({
      getFocusedTarget: mockGetFocusedTarget,
      setCaptureSuspended: mockSetCaptureSuspended,
    }),
  })
);

import { useShortcutCrudDispatch } from "../app/_components/workspace/keyboard-shortcuts/use-shortcut-crud-dispatch.ts";

function IntlWrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      {children}
    </NextIntlClientProvider>
  );
}

describe("useShortcutCrudDispatch", () => {
  it("opens delete confirmation instead of calling handler immediately", () => {
    const deleteHandler = vi.fn();
    mockGetFocusedTarget.mockReturnValue({
      targetId: "record-1",
      targetType: "record",
      handlers: {
        "crud.delete": deleteHandler,
      },
    });

    const { result } = renderHook(() => useShortcutCrudDispatch(), {
      wrapper: IntlWrapper,
    });

    act(() => {
      result.current.dispatchCrudAction("crud.delete");
    });

    expect(result.current.deleteConfirmOpen).toBe(true);
    expect(deleteHandler).not.toHaveBeenCalled();

    act(() => {
      result.current.confirmPendingDelete();
    });

    expect(deleteHandler).toHaveBeenCalledTimes(1);
    expect(result.current.deleteConfirmOpen).toBe(false);
  });
});
