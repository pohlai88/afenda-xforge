import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WorkspaceAuditEvidenceEvent } from "../app/_components/workspace/audit-evidence/workspace-audit-evidence.contract.ts";
import { WorkspaceAuditEvidence7W1HDetail } from "../app/_components/workspace/audit-evidence/workspace-audit-evidence-7w1h.tsx";
import {
  useWorkspaceAuditEvidence,
  WorkspaceAuditEvidenceProvider,
} from "../app/_components/workspace/audit-evidence/workspace-audit-evidence-context.tsx";
import { WorkspaceAuditEvidenceDockedLayout } from "../app/_components/workspace/audit-evidence/workspace-audit-evidence-docked-layout.tsx";
import {
  AUDIT_EVIDENCE_BOTTOM_OPEN_STORAGE_KEY,
  AUDIT_EVIDENCE_RIGHT_OPEN_STORAGE_KEY,
} from "../app/_components/workspace/audit-evidence/workspace-audit-evidence-panel.constants.ts";
import {
  WORKSPACE_METADATA_LABEL_CLASS,
  WORKSPACE_METADATA_SECTION_TO_LABEL_GAP_CLASS,
} from "../app/_components/workspace/workspace-shell.classes.ts";

vi.mock(
  "../app/_components/workspace/audit-evidence/workspace-audit-evidence.client.ts",
  () => ({
    fetchWorkspaceAuditEvidence: vi.fn().mockResolvedValue({
      items: [],
      limit: 20,
      offset: 0,
      total: 0,
    }),
  })
);

function ToggleProbe(): ReactElement {
  const { bottomOpen, rightOpen, toggleSheet } = useWorkspaceAuditEvidence();

  return (
    <div>
      <span data-testid="bottom-open">{String(bottomOpen)}</span>
      <span data-testid="right-open">{String(rightOpen)}</span>
      <button onClick={() => toggleSheet("bottom")} type="button">
        Toggle bottom
      </button>
      <button onClick={() => toggleSheet("right")} type="button">
        Toggle right
      </button>
    </div>
  );
}

function setMobileViewport(matches: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    addEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
  }));
}

describe("WorkspaceAuditEvidenceProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("toggles bottom and right sheet open state independently", async () => {
    render(
      <WorkspaceAuditEvidenceProvider>
        <ToggleProbe />
      </WorkspaceAuditEvidenceProvider>
    );

    expect(screen.getByTestId("bottom-open")).toHaveTextContent("false");
    expect(screen.getByTestId("right-open")).toHaveTextContent("false");

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Toggle bottom" }));
    });
    await waitFor(() => {
      expect(screen.getByTestId("bottom-open")).toHaveTextContent("true");
    });
    expect(screen.getByTestId("right-open")).toHaveTextContent("false");

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Toggle right" }));
    });
    await waitFor(() => {
      expect(screen.getByTestId("right-open")).toHaveTextContent("true");
    });

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Toggle bottom" }));
    });
    await waitFor(() => {
      expect(screen.getByTestId("bottom-open")).toHaveTextContent("false");
    });
  });

  it("persists panel open state to localStorage", async () => {
    render(
      <WorkspaceAuditEvidenceProvider>
        <ToggleProbe />
      </WorkspaceAuditEvidenceProvider>
    );

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Toggle bottom" }));
    });

    await waitFor(() => {
      expect(
        window.localStorage.getItem(AUDIT_EVIDENCE_BOTTOM_OPEN_STORAGE_KEY)
      ).toBe("1");
    });

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Toggle right" }));
    });

    await waitFor(() => {
      expect(
        window.localStorage.getItem(AUDIT_EVIDENCE_RIGHT_OPEN_STORAGE_KEY)
      ).toBe("1");
    });
  });

  it("renders a real accessible sheet on mobile viewports", async () => {
    setMobileViewport(true);

    render(
      <WorkspaceAuditEvidenceProvider>
        <ToggleProbe />
        <WorkspaceAuditEvidenceDockedLayout>
          <main>Primary workspace surface</main>
        </WorkspaceAuditEvidenceDockedLayout>
      </WorkspaceAuditEvidenceProvider>
    );

    expect(screen.getByText("Primary workspace surface")).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Toggle bottom" }));
    });

    expect(
      await screen.findByRole("dialog", { name: "Audit activity" })
    ).toBeInTheDocument();
  });

  it("renders right rail evidence metadata labels with canonical shell typography", () => {
    render(<WorkspaceAuditEvidence7W1HDetail event={makeAuditEvent()} />);

    for (const label of ["7W1H evidence", "Who", "Field changes", "Field"]) {
      const element = screen.getByText(label);

      for (const token of WORKSPACE_METADATA_LABEL_CLASS.split(" ")) {
        expect(element).toHaveClass(token);
      }
    }

    expect(
      screen
        .getByText("Field changes")
        .closest("[data-slot='workspace-audit-metadata-sections']")
    ).toHaveClass(WORKSPACE_METADATA_SECTION_TO_LABEL_GAP_CLASS);
  });
});

function makeAuditEvent(): WorkspaceAuditEvidenceEvent {
  return {
    action: "documents.update",
    actorId: "user-1",
    actorRole: "admin",
    actorType: "user",
    after: { status: "approved" },
    approvalId: null,
    before: { status: "draft" },
    channel: "web",
    companyId: "company-1",
    createdAt: "2026-06-12T00:00:00.000Z",
    diff: [
      {
        change: "changed",
        field: "status",
        newValue: "approved",
        oldValue: "draft",
      },
    ],
    grantId: null,
    id: "event-1",
    metadata: {},
    module: "documents",
    occurredAt: "2026-06-12T00:00:00.000Z",
    operationId: "operation-1",
    outcome: "success",
    policyReference: null,
    reason: "Document approval",
    requestId: "request-1",
    route: "/documents/doc-1",
    subjectId: "doc-1",
    subjectType: "document",
    summary: "Document status changed",
    surface: "documents",
    targetDisplayName: "Document 1",
    targetId: "doc-1",
    targetType: "document",
    tenantId: "tenant-1",
  };
}
