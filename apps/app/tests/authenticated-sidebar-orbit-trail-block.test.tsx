import { SidebarProvider } from "@repo/ui";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticatedSidebarOrbitTrailBlock } from "../app/_components/workspace/authenticated-sidebar-orbit-trail-block.tsx";
import type { OrbitTrailItem } from "../app/_components/workspace/orbit-trail.ts";
import {
  ORBIT_TRAIL_STORAGE_KEY,
  parseOrbitTrailInput,
} from "../app/_components/workspace/orbit-trail.ts";
import { WorkspaceAppNavSidebarBlocks } from "../app/_components/workspace/workspace-app-nav-sidebar-blocks.tsx";

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
  usePathname: () => "/dashboard",
}));

describe("Orbit Trail parser", () => {
  it("maps pressure syntax to routine, important, urgent, and critical", () => {
    expect(parseOrbitTrailInput("/payment review")?.pressure).toBe("routine");
    expect(parseOrbitTrailInput("! /payment review")?.pressure).toBe(
      "important"
    );
    expect(parseOrbitTrailInput("!! /payment review")?.pressure).toBe("urgent");
    expect(parseOrbitTrailInput("!!! /payment review")?.pressure).toBe(
      "critical"
    );
  });

  it("parses scope and creates the translated title", () => {
    const parsed = parseOrbitTrailInput("@chatgpt !!! /payment review invoice");

    expect(parsed).toMatchObject({
      pressure: "critical",
      scope: "payment",
      title: "ChatGPT payment review invoice",
    });
  });

  it("rejects empty add input", () => {
    expect(parseOrbitTrailInput("   ")).toBeNull();
  });
});

describe("AuthenticatedSidebarOrbitTrailBlock", () => {
  beforeEach(() => {
    window.localStorage.removeItem(ORBIT_TRAIL_STORAGE_KEY);
  });

  it("renders workspace, pinned, projects, and apps sections", () => {
    render(
      <SidebarProvider>
        <WorkspaceAppNavSidebarBlocks />
      </SidebarProvider>
    );

    const workspace = screen.getByText("The workspace");
    const newTodo = screen.getByRole("button", { name: "New To-Do" });
    const pinned = screen.getByText("Pinned");
    const projects = screen.getByText("Projects");
    const apps = screen.getByText("Apps");

    expect(workspace.compareDocumentPosition(newTodo)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(pinned.compareDocumentPosition(projects)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(projects.compareDocumentPosition(apps)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("adds an item with Enter when syntax is recognized", async () => {
    renderWithSidebar(<AuthenticatedSidebarOrbitTrailBlock />);

    fireEvent.change(screen.getByLabelText("Search or add Orbit Trail item"), {
      target: { value: "@chatgpt !!! /payment review invoice" },
    });
    fireEvent.keyDown(screen.getByLabelText("Search or add Orbit Trail item"), {
      key: "Enter",
    });

    expect(
      await screen.findByText("ChatGPT payment review invoice")
    ).toBeInTheDocument();
    expect(screen.getByText("payment")).toBeInTheDocument();
    expect(screen.getByLabelText("critical pressure")).toBeInTheDocument();
  });

  it("force-adds normal words with the top New To-Do action", async () => {
    renderWithSidebar(<WorkspaceAppNavSidebarBlocks />);

    fireEvent.change(screen.getByLabelText("Search or add Orbit Trail item"), {
      target: { value: "review plain note" },
    });
    fireEvent.click(screen.getByRole("button", { name: "New To-Do" }));

    expect(await screen.findByText("review plain note")).toBeInTheDocument();
    expect(screen.getByText("general")).toBeInTheDocument();
  });

  it("keeps the input expanded-only and avoids a card section wrapper", () => {
    const { container } = renderWithSidebar(
      <AuthenticatedSidebarOrbitTrailBlock />
    );
    const input = screen.getByLabelText("Search or add Orbit Trail item");

    expect(container.querySelector("section")).not.toBeInTheDocument();
    expect(input.parentElement).toHaveClass(
      "group-data-[collapsible=icon]:hidden"
    );
  });

  it("filters visible trail items when normal words are typed", async () => {
    window.localStorage.setItem(
      ORBIT_TRAIL_STORAGE_KEY,
      JSON.stringify([
        makeTrailItem({
          id: "one",
          scope: "Payment",
          title: "Vendor approval",
        }),
        makeTrailItem({ id: "two", title: "Payroll check", scope: "HR" }),
      ])
    );

    renderWithSidebar(<AuthenticatedSidebarOrbitTrailBlock />);

    expect(await screen.findByText("Vendor approval")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search or add Orbit Trail item"), {
      target: { value: "payroll" },
    });

    expect(screen.queryByText("Vendor approval")).not.toBeInTheDocument();
    expect(screen.getByText("Payroll check")).toBeInTheDocument();
  });

  it("renders only 10 visible open rows", async () => {
    window.localStorage.setItem(
      ORBIT_TRAIL_STORAGE_KEY,
      JSON.stringify(
        Array.from({ length: 12 }, (_, index) =>
          makeTrailItem({
            createdAt: `2026-06-12T00:${String(index).padStart(2, "0")}:00.000Z`,
            id: `item-${index}`,
            title: `Trail item ${index}`,
          })
        )
      )
    );

    renderWithSidebar(<AuthenticatedSidebarOrbitTrailBlock />);

    await waitFor(() => {
      expect(screen.getAllByLabelText(/pressure$/)).toHaveLength(10);
    });
  });

  it("sorts pinned items before non-pinned items", async () => {
    window.localStorage.setItem(
      ORBIT_TRAIL_STORAGE_KEY,
      JSON.stringify([
        makeTrailItem({
          createdAt: "2026-06-12T02:00:00.000Z",
          id: "new",
          title: "Newest item",
        }),
        makeTrailItem({
          createdAt: "2026-06-12T01:00:00.000Z",
          id: "pinned",
          pinned: true,
          title: "Pinned item",
        }),
      ])
    );

    renderWithSidebar(<AuthenticatedSidebarOrbitTrailBlock />);

    const pinned = await screen.findByText("Pinned item");
    const newest = screen.getByText("Newest item");

    expect(pinned.compareDocumentPosition(newest)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("hides done items from the default sidebar view", async () => {
    window.localStorage.setItem(
      ORBIT_TRAIL_STORAGE_KEY,
      JSON.stringify([
        makeTrailItem({ id: "open", title: "Open item" }),
        makeTrailItem({ done: true, id: "done", title: "Done item" }),
      ])
    );

    renderWithSidebar(<AuthenticatedSidebarOrbitTrailBlock />);

    expect(await screen.findByText("Open item")).toBeInTheDocument();
    expect(screen.queryByText("Done item")).not.toBeInTheDocument();
  });

  it("exposes pin, complete, and show more actions", async () => {
    window.localStorage.setItem(
      ORBIT_TRAIL_STORAGE_KEY,
      JSON.stringify([makeTrailItem({ id: "one", title: "Vendor approval" })])
    );

    renderWithSidebar(<AuthenticatedSidebarOrbitTrailBlock />);

    expect(await screen.findByText("Vendor approval")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Pin Vendor approval" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Complete Vendor approval" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Show more" })).toHaveAttribute(
      "href",
      "/infrastructure/matrix"
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Complete Vendor approval" })
    );
    expect(screen.queryByText("Vendor approval")).not.toBeInTheDocument();
  });
});

function renderWithSidebar(ui: ReactElement) {
  return render(<SidebarProvider>{ui}</SidebarProvider>);
}

function makeTrailItem(
  overrides: Partial<OrbitTrailItem> = {}
): OrbitTrailItem {
  return {
    createdAt: "2026-06-12T00:00:00.000Z",
    done: false,
    id: "trail-item",
    pinned: false,
    pressure: "routine",
    rawInput: "Vendor approval",
    scope: "Payment",
    scopeKind: "module",
    title: "Vendor approval",
    ...overrides,
  };
}
