import { companyMetadata } from "@repo/features-master-data-companies/metadata";
import { customerMetadata } from "@repo/features-master-data-customers/metadata";
import { act, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { createAppMetadataContext } from "../app/_lib/metadata-context.ts";
import { DashboardEntitySections } from "../app/[locale]/(authenticated)/dashboard/_components/dashboard-entity-sections.tsx";
import type { DashboardSectionState } from "../app/[locale]/(authenticated)/dashboard/dashboard-view.tsx";
import type { FocusedShortcutTarget } from "../lib/workspace-shortcuts/contract.ts";
import enMessages from "../messages/en.json";

function IntlWrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      {children}
    </NextIntlClientProvider>
  );
}

const registerFocusedTarget = vi.fn();
const refresh = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
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

vi.mock("../app/_components/authenticated-feature-scope.tsx", () => ({
  AuthenticatedFeatureScope: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@repo/metadata-ui/components", () => ({
  EntityMetadataPanel: ({
    onRowClick,
    rows,
    selectedRowId,
    title,
  }: {
    onRowClick?: (row: { id: string }) => void;
    rows: Array<{ id: string }>;
    selectedRowId?: string | null;
    title: string;
  }) => (
    <div>
      <h3>{title}</h3>
      {selectedRowId ? (
        <p>Selected row: press F2 to edit or F8 to archive.</p>
      ) : null}
      {rows.map((row) => (
        <button key={row.id} onClick={() => onRowClick?.(row)} type="button">
          {row.id}
        </button>
      ))}
    </div>
  ),
}));

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
    open ? <div data-testid="record-sheet">{children}</div> : null,
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
  toast: {
    message: vi.fn(),
  },
}));

vi.mock("../lib/master-data/customer-api.client.ts", () => ({
  archiveCustomerRecord: vi.fn(),
  updateCustomerRecord: vi.fn(),
}));

vi.mock("../lib/master-data/company-api.client.ts", () => ({
  archiveCompanyRecord: vi.fn(),
  updateCompanyRecord: vi.fn(),
}));

const createReadyState = (
  rows: readonly { id: string; [key: string]: string }[]
): DashboardSectionState => ({
  data: {
    items: rows,
    total: rows.length,
  },
  status: "ready",
});

describe("DashboardEntitySections shortcuts", () => {
  it("registers edit and delete handlers when a customer row is selected", () => {
    registerFocusedTarget.mockClear();

    render(
      <IntlWrapper>
        <DashboardEntitySections
        companies={{
          canWrite: true,
          metadata: companyMetadata,
          state: createReadyState([]),
          title: "Companies",
        }}
        context={createAppMetadataContext({
          featureId: "system-admin.overview",
          permissions: ["master-data.customers:write"],
          tenantId: "tenant-001",
          userId: "user-001",
        })}
        customers={{
          canWrite: true,
          metadata: customerMetadata,
          state: createReadyState([
            {
              code: "ACME",
              email: "ops@acme.test",
              id: "customer-1",
              name: "Acme Ops",
              status: "active",
            },
          ]),
          title: "Customers",
        }}
      />
      </IntlWrapper>
    );

    act(() => {
      screen.getByRole("button", { name: "customer-1" }).click();
    });

    const target = registerFocusedTarget.mock.calls.at(
      -1
    )?.[0] as FocusedShortcutTarget;

    expect(target.handlers["crud.edit"]).toEqual(expect.any(Function));
    expect(target.handlers["crud.delete"]).toEqual(expect.any(Function));
  });

  it("opens the edit sheet when crud.edit is invoked", () => {
    registerFocusedTarget.mockClear();

    render(
      <IntlWrapper>
        <DashboardEntitySections
        companies={{
          canWrite: true,
          metadata: companyMetadata,
          state: createReadyState([]),
          title: "Companies",
        }}
        context={createAppMetadataContext({
          featureId: "system-admin.overview",
          permissions: ["master-data.customers:write"],
          tenantId: "tenant-001",
          userId: "user-001",
        })}
        customers={{
          canWrite: true,
          metadata: customerMetadata,
          state: createReadyState([
            {
              code: "ACME",
              email: "ops@acme.test",
              id: "customer-1",
              name: "Acme Ops",
              status: "active",
            },
          ]),
          title: "Customers",
        }}
      />
      </IntlWrapper>
    );

    act(() => {
      screen.getByRole("button", { name: "customer-1" }).click();
    });

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
    expect(screen.getByTestId("record-sheet")).toBeInTheDocument();
  });
});
