import { SidebarProvider } from "@repo/ui";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { HrSuiteSiteContentTopbar } from "../app/_components/workspace/hr-suite-site-content-topbar.tsx";
import {
  HR_SUITE_SITE_NAV_GROUPS,
  resolveHrSuiteSiteNavSearch,
} from "../app/_components/workspace/hr-suite-site-nav.ts";
import { HrSuiteSiteSidebar } from "../app/_components/workspace/hr-suite-site-sidebar.tsx";
import {
  SITE_LEFT_SIDEBAR_SCROLL_AREA_CLASS,
  WORKSPACE_METADATA_LABEL_TO_ITEM_GAP_CLASS,
  WORKSPACE_METADATA_SECTION_TO_LABEL_GAP_CLASS,
  WORKSPACE_SHELL_INTERACTIVE_CLASS,
  WORKSPACE_SIDEBAR_ITEM_TO_ITEM_GAP_CLASS,
  WORKSPACE_STANDARD_METADATA_LABEL_CLASS,
} from "../app/_components/workspace/workspace-shell.classes.ts";

const HR_DOCUMENTS_FEATURE_ID =
  "hr-suite.employee-management.documents-management";

function expectClassTokens(element: HTMLElement, className: string): void {
  for (const token of className.split(" ")) {
    expect(element).toHaveClass(token);
  }
}

function expectMetadataLabelClass(element: HTMLElement): void {
  expectClassTokens(element, WORKSPACE_STANDARD_METADATA_LABEL_CLASS);
}

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => "/hr",
}));

describe("HrSuiteSiteSidebar", () => {
  it("renders site sidebar metadata labels with canonical shell typography", () => {
    renderWithSidebar(
      <HrSuiteSiteSidebar
        activeFeatureId={HR_DOCUMENTS_FEATURE_ID}
        mode="live"
        onSelect={vi.fn()}
      />
    );

    expectMetadataLabelClass(screen.getByText("HR Suite"));
    expect(screen.queryByText("Most used")).not.toBeInTheDocument();
    expect(screen.getByText("HR Console").closest("ul")).toHaveAttribute(
      "data-slot",
      "site-sidebar-shortcuts-items"
    );
    expect(screen.getByText("HR Console").closest("ul")).toHaveClass("grid");
    expect(
      screen
        .getByText("HR Suite")
        .closest("[data-slot='site-sidebar-feature-shortcuts']")
    ).toHaveClass("gap-0.5");
    expect(
      screen
        .getByText("HR Console")
        .closest("[data-slot='site-sidebar-feature-shortcuts']")
    ).not.toBeNull();

    for (const group of HR_SUITE_SITE_NAV_GROUPS) {
      const firstGroupItem = group.items[0];

      if (!firstGroupItem) {
        throw new Error(`${group.navLabel} must declare at least one item.`);
      }

      const groupLabel = screen.getByText(group.navLabel);
      const groupSection = groupLabel.closest(
        "[data-slot='site-sidebar-metadata-section']"
      );
      const firstItem = screen.getByText(firstGroupItem.label);
      const itemList = firstItem.closest(
        "[data-slot='site-sidebar-metadata-items']"
      );

      expectMetadataLabelClass(groupLabel);
      expect(groupLabel.closest("button")).toHaveClass("h-6", "px-2");
      expectClassTokens(
        groupLabel.closest("button") as HTMLElement,
        WORKSPACE_SHELL_INTERACTIVE_CLASS
      );
      expect(groupLabel.closest("button")).toHaveAttribute(
        "data-slot",
        "site-sidebar-metadata-label"
      );
      expect(groupSection).toHaveAttribute("data-nav-label", group.navLabel);
      expect(
        groupSection?.closest("[data-slot='site-sidebar-body']")
      ).toHaveClass(WORKSPACE_METADATA_SECTION_TO_LABEL_GAP_CLASS);
      expect(
        groupSection?.closest("[data-slot='site-sidebar-nav-groups']")
      ).toHaveClass(WORKSPACE_METADATA_SECTION_TO_LABEL_GAP_CLASS);
      expect(itemList).toHaveClass(WORKSPACE_METADATA_LABEL_TO_ITEM_GAP_CLASS);
      expect(itemList).toHaveClass(WORKSPACE_SIDEBAR_ITEM_TO_ITEM_GAP_CLASS);
    }
  });

  it("keeps local search fixed above the scrollable HR Suite sidebar label", () => {
    renderWithSidebar(
      <HrSuiteSiteSidebar
        activeFeatureId={HR_DOCUMENTS_FEATURE_ID}
        mode="live"
        onSelect={vi.fn()}
      />
    );

    const header = screen
      .getByRole("searchbox", { name: "Search HR Suite" })
      .closest("[data-slot='site-staging-sidebar-feature']");

    expect(header).not.toBeNull();
    expect(
      within(header as HTMLElement).getByRole("searchbox", {
        name: "Search HR Suite",
      })
    ).toBeInTheDocument();
    expect(within(header as HTMLElement).queryByText("HR Suite")).toBeNull();

    const featureShortcuts = screen
      .getByText("HR Suite")
      .closest("[data-slot='site-sidebar-feature-shortcuts']");

    expect(
      featureShortcuts?.closest("[data-slot='scroll-area']")
    ).not.toBeNull();
  });

  it("extends the site sidebar scroll track to the bottom boundary", () => {
    renderWithSidebar(
      <HrSuiteSiteSidebar
        activeFeatureId={HR_DOCUMENTS_FEATURE_ID}
        mode="live"
        onSelect={vi.fn()}
      />
    );

    const scrollArea = screen
      .getByText("Time & Attendance")
      .closest("[data-slot='scroll-area']");

    expect(scrollArea).not.toBeNull();
    expectClassTokens(
      scrollArea as HTMLElement,
      SITE_LEFT_SIDEBAR_SCROLL_AREA_CLASS
    );
  });

  it("renders shortcut cards above grouped metadata sections", () => {
    renderWithSidebar(
      <HrSuiteSiteSidebar
        activeFeatureId={HR_DOCUMENTS_FEATURE_ID}
        mode="live"
        onSelect={vi.fn()}
      />
    );

    const shortcutsSection = screen
      .getByText("HR Console")
      .closest("[data-slot='site-sidebar-shortcuts-section']");
    const firstMetadataSection = screen
      .getByText(HR_SUITE_SITE_NAV_GROUPS[0]?.navLabel ?? "")
      .closest("[data-slot='site-sidebar-metadata-section']");

    expect(shortcutsSection).not.toBeNull();
    expect(firstMetadataSection).not.toBeNull();
    expect(
      shortcutsSection?.compareDocumentPosition(firstMetadataSection as Node)
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    for (const label of [
      "HR Console",
      "Org Chart",
      "Seed Book",
      "Announcements",
      "Workflows",
      "Help & Escalation",
    ]) {
      expect(
        within(shortcutsSection as HTMLElement).getByText(label)
      ).toBeVisible();
    }
  });

  it("searches by functional metadata and promotes the best recommendation", () => {
    renderWithSidebar(
      <HrSuiteSiteSidebar
        activeFeatureId={HR_DOCUMENTS_FEATURE_ID}
        mode="preview"
        onSelect={vi.fn()}
      />
    );

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search HR Suite" }),
      {
        target: { value: "pto" },
      }
    );

    expect(screen.getByText("Best match")).toBeVisible();
    expect(
      within(
        screen
          .getByText("Best match")
          .closest(
            "[data-slot='site-sidebar-best-match-section']"
          ) as HTMLElement
      ).getByRole("button", { name: "Leave Attendance Management" })
    ).toBeVisible();
    expect(screen.queryByText("Payroll Processing")).not.toBeInTheDocument();
  });

  it("resolves local fuzzy search from HR Suite metadata", () => {
    const result = resolveHrSuiteSiteNavSearch("employee records");

    expect(result.bestItem?.featureId).toBe(
      "hr-suite.employee-management.employee-records-management"
    );
    expect(result.resultCount).toBeGreaterThan(0);
  });

  it("resolves complaint and help terms to Help & Escalation", () => {
    for (const query of [
      "complaint",
      "grievance",
      "help",
      "support",
      "urgent",
      "escalation",
    ]) {
      expect(resolveHrSuiteSiteNavSearch(query).bestItem?.featureId).toBe(
        "hr-suite.shortcuts.help-escalation"
      );
    }
  });

  it("renders site topbar metadata labels with canonical shell typography", () => {
    render(
      <HrSuiteSiteContentTopbar activeFeatureId={HR_DOCUMENTS_FEATURE_ID} />
    );

    expectMetadataLabelClass(screen.getByText("HR Suite"));
    expectMetadataLabelClass(screen.getByText("Employee Management"));
    expectMetadataLabelClass(screen.getByText("Documents Management"));
  });

  it("renders live routes as links and scaffold routes as inert buttons in live mode", () => {
    const onSelect = vi.fn();

    renderWithSidebar(
      <HrSuiteSiteSidebar
        activeFeatureId={HR_DOCUMENTS_FEATURE_ID}
        mode="live"
        onSelect={onSelect}
      />
    );

    expect(
      screen
        .getByRole("button", { name: "Documents Management" })
        .closest("[data-slot='site-sidebar-tree-folder']")
    ).not.toBeNull();
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "href",
      "/hr"
    );
    expect(
      screen.getByRole("link", { name: "Document Directory" })
    ).toHaveAttribute("href", "/hr/documents");
    expect(
      screen.queryByRole("link", { name: "HR Hub" })
    ).not.toBeInTheDocument();

    const scaffoldButton = screen.getByRole("button", {
      name: "Employee Records Management",
    });

    expect(scaffoldButton).toBeDisabled();
    fireEvent.click(scaffoldButton);
    expect(onSelect).not.toHaveBeenCalled();

    const scaffoldCard = screen.getByRole("button", {
      name: /Help & Escalation/,
    });

    expect(scaffoldCard).toBeDisabled();
    fireEvent.click(scaffoldCard);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("allows scaffold selection in preview mode", () => {
    const onSelect = vi.fn();

    renderWithSidebar(
      <HrSuiteSiteSidebar
        activeFeatureId={HR_DOCUMENTS_FEATURE_ID}
        mode="preview"
        onSelect={onSelect}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Employee Records Management" })
    );

    expect(onSelect).toHaveBeenCalledWith(
      "hr-suite.employee-management.employee-records-management"
    );

    fireEvent.click(screen.getByRole("button", { name: /Help & Escalation/ }));

    expect(onSelect).toHaveBeenCalledWith("hr-suite.shortcuts.help-escalation");
  });
});

function renderWithSidebar(ui: ReactNode) {
  return render(<SidebarProvider>{ui}</SidebarProvider>);
}
