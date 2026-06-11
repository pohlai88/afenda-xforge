import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { ShortcutFnKeyBadge } from "../app/_components/workspace/keyboard-shortcuts/shortcut-source-badge.tsx";
import enMessages from "../messages/en.json";

function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("ShortcutFnKeyBadge", () => {
  it("renders an Fn key badge for function-key bindings", () => {
    renderWithIntl(<ShortcutFnKeyBadge normalized="f2" />);

    expect(screen.getByText("Fn key")).toBeInTheDocument();
  });

  it("renders nothing for non-function-key bindings", () => {
    const { container } = renderWithIntl(
      <ShortcutFnKeyBadge normalized="mod+k" />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
