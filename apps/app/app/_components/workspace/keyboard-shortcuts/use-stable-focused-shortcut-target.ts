"use client";

import type { DependencyList } from "react";
import { useMemo } from "react";
import type { FocusedShortcutTarget } from "../../../../lib/workspace-shortcuts/contract.ts";
import { useRegisterFocusedShortcutTarget } from "./use-keyboard-shortcuts.tsx";

export function useStableFocusedShortcutTarget(
  factory: () => FocusedShortcutTarget | null,
  deps: DependencyList
): void {
  const target = useMemo(factory, deps);
  useRegisterFocusedShortcutTarget(target);
}
