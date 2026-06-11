import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ShortcutFnKeyBadge } from "../app/_components/workspace/keyboard-shortcuts/shortcut-source-badge.tsx";

describe("ShortcutFnKeyBadge", () => {
  it("renders an Fn key badge for function-key bindings", () => {
    render(<ShortcutFnKeyBadge normalized="f2" />);

    expect(screen.getByText("Fn key")).toBeInTheDocument();
  });

  it("renders nothing for non-function-key bindings", () => {
    const { container } = render(<ShortcutFnKeyBadge normalized="mod+k" />);

    expect(container).toBeEmptyDOMElement();
  });
});
