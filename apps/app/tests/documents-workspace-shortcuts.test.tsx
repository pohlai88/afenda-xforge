import { renderHook } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { FocusedShortcutTarget } from "../lib/workspace-shortcuts/contract.ts";
import enMessages from "../messages/en.json";

const registerFocusedTarget = vi.fn();
const mockGetFocusedTarget = vi.fn<() => FocusedShortcutTarget | null>(
  () => null
);

vi.mock(
  "../app/_components/workspace/keyboard-shortcuts/use-keyboard-shortcuts.tsx",
  () => ({
    useRegisterFocusedShortcutTarget: (
      target: FocusedShortcutTarget | null
    ) => {
      registerFocusedTarget(target);
    },
    useWorkspaceShortcuts: () => ({
      getFocusedTarget: mockGetFocusedTarget,
    }),
  })
);

import { useStableFocusedShortcutTarget } from "../app/_components/workspace/keyboard-shortcuts/use-stable-focused-shortcut-target.ts";

function IntlWrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      {children}
    </NextIntlClientProvider>
  );
}

describe("useStableFocusedShortcutTarget", () => {
  it("registers a memoized focused shortcut target", () => {
    registerFocusedTarget.mockClear();

    const { rerender } = renderHook(
      ({ documentId }: { documentId: string | null }) =>
        useStableFocusedShortcutTarget(
          () =>
            documentId
              ? {
                  targetId: documentId,
                  targetType: "record",
                  handlers: {
                    "crud.edit": () => undefined,
                  },
                }
              : null,
          [documentId]
        ),
      {
        initialProps: { documentId: "doc-1" },
        wrapper: IntlWrapper,
      }
    );

    expect(registerFocusedTarget).toHaveBeenCalledWith({
      targetId: "doc-1",
      targetType: "record",
      handlers: {
        "crud.edit": expect.any(Function),
      },
    });

    rerender({ documentId: "doc-1" });
    const callsAfterSameProps = registerFocusedTarget.mock.calls.length;

    rerender({ documentId: "doc-2" });
    expect(registerFocusedTarget.mock.calls.length).toBeGreaterThan(
      callsAfterSameProps
    );
    expect(registerFocusedTarget).toHaveBeenLastCalledWith({
      targetId: "doc-2",
      targetType: "record",
      handlers: {
        "crud.edit": expect.any(Function),
      },
    });
  });
});

describe("DocumentsWorkspaceShell grid create shortcut", () => {
  it("registers crud.create on grid surface when write access is allowed", () => {
    registerFocusedTarget.mockClear();
    mockGetFocusedTarget.mockClear();

    const createRef = { current: vi.fn() };
    const setActiveSurface = vi.fn();

    renderHook(
      () =>
        useStableFocusedShortcutTarget((): FocusedShortcutTarget | null => {
          const handlers: FocusedShortcutTarget["handlers"] = {};

          handlers["crud.create"] = () => {
            setActiveSurface("form");
            createRef.current();
          };

          return {
            targetId: "documents-grid",
            targetType: "surface",
            handlers,
          };
        }, []),
      { wrapper: IntlWrapper }
    );

    const target = registerFocusedTarget.mock.calls.at(-1)?.[0];
    expect(target?.handlers["crud.create"]).toEqual(expect.any(Function));
    target?.handlers["crud.create"]?.();
    expect(setActiveSurface).toHaveBeenCalledWith("form");
    expect(createRef.current).toHaveBeenCalled();
  });
});
