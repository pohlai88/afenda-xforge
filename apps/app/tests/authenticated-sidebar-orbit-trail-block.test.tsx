import { SidebarProvider } from "@repo/ui";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticatedSidebarOrbitTrailBlock } from "../app/_components/workspace/authenticated-sidebar-orbit-trail-block.tsx";
import type { OrbitTrailItem } from "../app/_components/workspace/orbit-trail.ts";
import {
  ORBIT_SYNTAX_GUIDE_EXAMPLE,
  ORBIT_SYNTAX_GUIDE_LINES,
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
  it("maps Eisenhower pressure syntax to routine, important, urgent, and critical", () => {
    expect(parseOrbitTrailInput("R /payment review")?.pressure).toBe("routine");
    expect(parseOrbitTrailInput("!M /payment review")?.pressure).toBe(
      "important"
    );
    expect(parseOrbitTrailInput("!I /payment review")?.pressure).toBe(
      "important"
    );
    expect(parseOrbitTrailInput("!U /payment review")?.pressure).toBe("urgent");
    expect(parseOrbitTrailInput("!C /payment review")?.pressure).toBe(
      "critical"
    );
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

  it("renders workspace, Eisenhower matrix, and apps sections", async () => {
    render(
      <SidebarProvider>
        <WorkspaceAppNavSidebarBlocks />
      </SidebarProvider>
    );

    const workspace = screen.getByText("The workspace");
    const newTodo = screen.getByRole("button", { name: "New To-Do" });
    const eisenhower = await screen.findByText("EISENHOWER MATRIX (3/30)");
    const apps = screen.getByText("Apps");

    expect(workspace.compareDocumentPosition(newTodo)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(eisenhower.compareDocumentPosition(apps)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("does not render a visible add input or syntax hint", () => {
    renderWithSidebar(<AuthenticatedSidebarOrbitTrailBlock />);

    expect(screen.queryByPlaceholderText("Add...")).not.toBeInTheDocument();
    expect(screen.queryByText("@who ! /where #when")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Add trail" })
    ).not.toBeInTheDocument();
  });

  it("adds an item with Enter and applies the active Eisenhower tab pressure", async () => {
    renderWithSidebar(<AuthenticatedSidebarOrbitTrailBlock />);

    fireEvent.click(screen.getByRole("tab", { name: "!C" }));
    fireEvent.change(screen.getByLabelText("Add Orbit Trail item"), {
      target: { value: "@chatgpt /payment review invoice" },
    });
    fireEvent.keyDown(screen.getByLabelText("Add Orbit Trail item"), {
      key: "Enter",
    });

    const addedRow = (await screen.findByText("ChatGPT payment review invoice"))
      .closest("li");

    expect(addedRow).not.toBeNull();
    expect(
      within(addedRow as HTMLElement).getByLabelText("critical pressure")
    ).toBeInTheDocument();
  });

  it("force-adds normal words with the top New To-Do action", async () => {
    renderWithSidebar(<WorkspaceAppNavSidebarBlocks />);

    fireEvent.change(screen.getByLabelText("Add Orbit Trail item"), {
      target: { value: "review plain note" },
    });
    fireEvent.click(screen.getByRole("button", { name: "New To-Do" }));

    expect(await screen.findByText("review plain note")).toBeInTheDocument();
  });

  it("pre-seeds each matrix tab for onboarding when storage is empty", async () => {
    renderWithSidebar(<AuthenticatedSidebarOrbitTrailBlock />);

    fireEvent.click(screen.getByRole("tab", { name: "!M" }));
    expect(
      await screen.findByText("quarterly planning review")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "!U" }));
    expect(
      await screen.findByText("client follow-up today")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "!C" }));
    expect(
      await screen.findByText("RHB AP payment check")
    ).toBeInTheDocument();
  });

  it("renders Guide tab with syntax guide dropdown", () => {
    renderWithSidebar(<AuthenticatedSidebarOrbitTrailBlock />);

    expect(screen.getByRole("tab", { name: "Guide syntax" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /R Routine/ })).not.toBeInTheDocument();
    expect(
      screen.getByText(ORBIT_SYNTAX_GUIDE_EXAMPLE.input)
    ).toBeInTheDocument();
    expect(
      screen.getByText(ORBIT_SYNTAX_GUIDE_EXAMPLE.output)
    ).toBeInTheDocument();

    for (const line of ORBIT_SYNTAX_GUIDE_LINES) {
      expect(screen.getByText(line.meaning)).toBeInTheDocument();
    }
  });

  it("renders matrix tabs directly under the Eisenhower metadata label", async () => {
    renderWithSidebar(<AuthenticatedSidebarOrbitTrailBlock />);

    const eisenhower = await screen.findByText("EISENHOWER MATRIX (3/30)");
    const guideTab = screen.getByRole("tab", { name: "Guide syntax" });

    expect(eisenhower).toHaveClass("px-2", "text-[8px]");
    expect(eisenhower.compareDocumentPosition(guideTab)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("renders Eisenhower matrix label and pressure tabs", async () => {
    renderWithSidebar(<AuthenticatedSidebarOrbitTrailBlock />);

    expect(
      await screen.findByText("EISENHOWER MATRIX (3/30)")
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Guide syntax" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "!M" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "!U" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "!C" })).toBeInTheDocument();
  });

  it("renders only 10 visible open rows per pressure tab", async () => {
    window.localStorage.setItem(
      ORBIT_TRAIL_STORAGE_KEY,
      JSON.stringify(
        Array.from({ length: 12 }, (_, index) =>
          makeTrailItem({
            createdAt: `2026-06-12T00:${String(index).padStart(2, "0")}:00.000Z`,
            id: `item-${index}`,
            pressure: "important",
            title: `Trail item ${index}`,
          })
        )
      )
    );

    renderWithSidebar(<AuthenticatedSidebarOrbitTrailBlock />);
    fireEvent.click(screen.getByRole("tab", { name: "!M" }));

    await waitFor(() => {
      expect(screen.getAllByLabelText(/pressure$/)).toHaveLength(10);
    });
  });

  it("sorts pinned items before non-pinned items in the active tab", async () => {
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
    fireEvent.click(screen.getByRole("tab", { name: "!M" }));

    const pinned = await screen.findByText("Pinned item");
    const newest = screen.getByText("Newest item");

    expect(pinned.compareDocumentPosition(newest)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("collapses and expands each Eisenhower tab dropdown independently", async () => {
    window.localStorage.setItem(
      ORBIT_TRAIL_STORAGE_KEY,
      JSON.stringify([
        makeTrailItem({
          id: "important",
          title: "Important trail row",
        }),
        makeTrailItem({
          id: "critical",
          pressure: "critical",
          title: "Critical trail row",
        }),
      ])
    );

    renderWithSidebar(<AuthenticatedSidebarOrbitTrailBlock />);

    expect(screen.getByText("who / what")).toBeInTheDocument();
    expect(screen.queryByText("Important trail row")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "!M" }));
    expect(await screen.findByText("Important trail row")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "!M" }));
    expect(screen.queryByText("Important trail row")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("tab", { name: "!C" })
    );
    expect(await screen.findByText("Critical trail row")).toBeInTheDocument();
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
    fireEvent.click(screen.getByRole("tab", { name: "!M" }));

    expect(await screen.findByText("Open item")).toBeInTheDocument();
    expect(screen.queryByText("Done item")).not.toBeInTheDocument();
  });

  it("updates the matrix counter in the metadata label", async () => {
    window.localStorage.setItem(
      ORBIT_TRAIL_STORAGE_KEY,
      JSON.stringify([
        makeTrailItem({ id: "one", title: "One" }),
        makeTrailItem({ id: "two", title: "Two" }),
      ])
    );

    renderWithSidebar(<AuthenticatedSidebarOrbitTrailBlock />);

    expect(
      await screen.findByText("EISENHOWER MATRIX (2/30)")
    ).toBeInTheDocument();
  });

  it("switches pressure tabs and filters rows by urgency", async () => {
    window.localStorage.setItem(
      ORBIT_TRAIL_STORAGE_KEY,
      JSON.stringify([
        makeTrailItem({
          id: "important",
          pressure: "important",
          title: "Important follow-up",
        }),
        makeTrailItem({
          id: "critical",
          pressure: "critical",
          title: "Critical escalation",
        }),
      ])
    );

    renderWithSidebar(<AuthenticatedSidebarOrbitTrailBlock />);

    fireEvent.click(screen.getByRole("tab", { name: "!M" }));
    expect(await screen.findByText("Important follow-up")).toBeInTheDocument();
    expect(screen.queryByText("Critical escalation")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("tab", { name: "!C" })
    );

    expect(await screen.findByText("Critical escalation")).toBeInTheDocument();
    expect(screen.queryByText("Important follow-up")).not.toBeInTheDocument();
  });

  it("exposes pin, complete, and show more actions", async () => {
    window.localStorage.setItem(
      ORBIT_TRAIL_STORAGE_KEY,
      JSON.stringify([makeTrailItem({ id: "one", title: "Vendor approval" })])
    );

    renderWithSidebar(<AuthenticatedSidebarOrbitTrailBlock />);
    fireEvent.click(screen.getByRole("tab", { name: "!M" }));

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
    pressure: "important",
    rawInput: "Vendor approval",
    scope: "general",
    scopeKind: "unknown",
    syntaxKind: "who",
    syntaxSymbol: "@",
    syntaxValue: "Vendor approval",
    title: "Vendor approval",
    ...overrides,
  };
}
