import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FocusedShortcutTarget } from "../lib/workspace-shortcuts/contract.ts";

const registerFocusedTarget = vi.fn();
const push = vi.fn();
const refresh = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
}));

vi.mock(
  "../app/_components/workspace/keyboard-shortcuts/use-stable-focused-shortcut-target.ts",
  () => ({
    useStableFocusedShortcutTarget: (
      factory: () => FocusedShortcutTarget | null
    ) => {
      registerFocusedTarget(factory());
    },
  })
);

vi.mock("@repo/ui", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button onClick={onClick} type="button">
      {children}
    </button>
  ),
  Input: (props: React.ComponentProps<"input">) => <input {...props} />,
  Label: ({
    children,
    htmlFor,
  }: {
    children: React.ReactNode;
    htmlFor?: string;
  }) => <label htmlFor={htmlFor}>{children}</label>,
  Sheet: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? <div data-testid="edit-sheet">{children}</div> : null,
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SheetDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  SheetFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SheetHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  Textarea: (props: React.ComponentProps<"textarea">) => (
    <textarea {...props} />
  ),
  toast: {
    message: vi.fn(),
  },
}));

vi.mock("../lib/hr-documents/document-api.client.ts", () => ({
  deleteHrDocument: vi.fn(),
  updateHrDocument: vi.fn(),
}));

import { DocumentDetailWorkspace } from "../app/[locale]/(authenticated)/hr/documents/_components/document-detail-workspace.tsx";

describe("DocumentDetailWorkspace shortcuts", () => {
  it("registers detail record handlers for cancel navigation", () => {
    registerFocusedTarget.mockClear();
    push.mockClear();

    render(
      <DocumentDetailWorkspace
        canWrite
        documentDescription="Policy handbook"
        documentId="doc-123"
        documentTitle="Employee Handbook"
        requestHeaders={{ "x-tenant-id": "tenant-001" }}
      >
        <div>detail</div>
      </DocumentDetailWorkspace>
    );

    expect(registerFocusedTarget).toHaveBeenCalledWith(
      expect.objectContaining({
        targetId: "doc-123",
        targetType: "record",
      })
    );

    const target = registerFocusedTarget.mock.calls.at(
      -1
    )?.[0] as FocusedShortcutTarget;
    target.handlers["crud.cancel"]?.();
    expect(push).toHaveBeenCalledWith("/hr/documents");
  });

  it("opens edit form handlers when crud.edit is invoked", () => {
    registerFocusedTarget.mockClear();

    render(
      <DocumentDetailWorkspace
        canWrite
        documentDescription="Policy handbook"
        documentId="doc-123"
        documentTitle="Employee Handbook"
        requestHeaders={{ "x-tenant-id": "tenant-001" }}
      >
        <div>detail</div>
      </DocumentDetailWorkspace>
    );

    const initialTarget = registerFocusedTarget.mock.calls.at(
      -1
    )?.[0] as FocusedShortcutTarget;
    act(() => {
      initialTarget.handlers["crud.edit"]?.();
    });

    const editTarget = registerFocusedTarget.mock.calls.at(
      -1
    )?.[0] as FocusedShortcutTarget;
    expect(editTarget.targetType).toBe("form");
    expect(editTarget.handlers["crud.save"]).toEqual(expect.any(Function));
  });
});
