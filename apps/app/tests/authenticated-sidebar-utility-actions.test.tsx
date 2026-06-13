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
import { WORKSPACE_SHELL_INTERACTIVE_CLASS } from "../app/_components/workspace/workspace-shell.classes.ts";

function expectClassTokens(element: HTMLElement, className: string): void {
  for (const token of className.split(" ")) {
    expect(element).toHaveClass(token);
  }
}

describe("AuthenticatedSidebarUtilityActions", () => {
  it("renders Ctrl+key shortcut hints and the action labels", () => {
    renderWithSidebar(<AuthenticatedSidebarUtilityActions />);

    const newTodo = screen.getByRole("button", { name: "New To-Do" });

    expect(newTodo).toBeInTheDocument();
    expectClassTokens(newTodo, WORKSPACE_SHELL_INTERACTIVE_CLASS);
    expect(
      screen.getByRole("button", { name: "New Project" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lynx" })).toBeDisabled();
    expect(
      screen.queryByRole("link", { name: "Lynx" })
    ).not.toBeInTheDocument();
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
