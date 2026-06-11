import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FocusedShortcutTarget } from "../lib/workspace-shortcuts/contract.ts";

const registerFocusedTarget = vi.fn();

vi.mock(
  "../app/_components/workspace/keyboard-shortcuts/use-keyboard-shortcuts.tsx",
  () => ({
    useRegisterFocusedShortcutTarget: (
      target: FocusedShortcutTarget | null
    ) => {
      registerFocusedTarget(target);
    },
  })
);

import { useStableFocusedShortcutTarget } from "../app/_components/workspace/keyboard-shortcuts/use-stable-focused-shortcut-target.ts";

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
      { initialProps: { documentId: "doc-1" } }
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
