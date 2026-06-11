import { describe, expect, it } from "vitest";
import {
  formatShortcutKeyTokens,
  formatShortcutLabel,
} from "../lib/workspace-shortcuts/format-shortcut.ts";

describe("formatShortcutKeyTokens", () => {
  it("splits normalized bindings into display tokens", () => {
    expect(formatShortcutKeyTokens("mod+k")).toEqual(["Ctrl/Cmd", "K"]);
    expect(formatShortcutKeyTokens("f2")).toEqual(["F2"]);
    expect(formatShortcutLabel("mod+k")).toBe("Ctrl/Cmd + K");
  });
});
