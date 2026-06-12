import { SidebarProvider } from "@repo/ui";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { AuthenticatedSidebarUtilityActions } from "../app/_components/workspace/authenticated-sidebar-utility-actions.tsx";

describe("AuthenticatedSidebarUtilityActions", () => {
  it("renders the visible Ctrl-only hint and the action labels", () => {
    renderWithSidebar(<AuthenticatedSidebarUtilityActions />);

    expect(screen.getByRole("button", { name: "New To-Do" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "New Project" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lynx" })).toBeInTheDocument();
    expect(screen.getAllByText("Ctrl").length).toBeGreaterThan(0);
    expect(screen.queryByText("Cmd")).not.toBeInTheDocument();
    expect(screen.queryByText("Ctrl/Cmd")).not.toBeInTheDocument();
  });
});

function renderWithSidebar(ui: ReactElement) {
  return render(<SidebarProvider>{ui}</SidebarProvider>);
}
