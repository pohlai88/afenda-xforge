import { SidebarProvider } from "@repo/ui";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { AuthenticatedSidebarUtilityActions } from "../app/_components/workspace/authenticated-sidebar-utility-actions.tsx";

describe("AuthenticatedSidebarUtilityActions", () => {
  it("renders Ctrl+key shortcut hints and the action labels", () => {
    renderWithSidebar(<AuthenticatedSidebarUtilityActions />);

    expect(screen.getByRole("button", { name: "New To-Do" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "New Project" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lynx" })).toBeInTheDocument();
    expect(screen.getByText("Ctrl+N")).toBeInTheDocument();
    expect(screen.getByText("Ctrl+P")).toBeInTheDocument();
    expect(screen.getByText("Ctrl+K")).toBeInTheDocument();
    expect(screen.getByText("Ctrl+L")).toBeInTheDocument();
    expect(screen.queryByText("Ctrl/Cmd")).not.toBeInTheDocument();
  });
});

function renderWithSidebar(ui: ReactElement) {
  return render(<SidebarProvider>{ui}</SidebarProvider>);
}
