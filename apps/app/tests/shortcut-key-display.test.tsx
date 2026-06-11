import { NextIntlClientProvider } from "next-intl";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { ShortcutKeyDisplay } from "../app/_components/workspace/keyboard-shortcuts/shortcut-key-display.tsx";
import enMessages from "../messages/en.json";

function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("ShortcutKeyDisplay", () => {
  it("renders per-key caps for modifier combinations", () => {
    renderWithIntl(<ShortcutKeyDisplay normalized="mod+k" />);

    expect(screen.getByText("Ctrl/Cmd")).toBeInTheDocument();
    expect(screen.getByText("K")).toBeInTheDocument();
  });

  it("renders secondary bindings with an or separator", () => {
    renderWithIntl(
      <ShortcutKeyDisplay normalized="f1" secondaryNormalized="mod+/" />
    );

    expect(screen.getByText("F1")).toBeInTheDocument();
    expect(screen.getByText("or")).toBeInTheDocument();
    expect(screen.getByText("/")).toBeInTheDocument();
  });
});
