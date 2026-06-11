"use client";

import type { CustomizationLayerSet } from "@repo/customization/resolution";
import type { EntityMetadata } from "@repo/metadata";
import { EntityMetadataPanel } from "@repo/metadata-ui/components";
import type { MetadataRenderContext } from "@repo/metadata-ui/contracts";
import type { DashboardTableRow } from "@repo/ui";
import {
  Button,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  toast,
} from "@repo/ui";
import type { ReactElement } from "react";
import { useCallback, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { withCSRFHeader } from "../../../../../lib/csrf.client.ts";
import type {
  FocusedShortcutTarget,
  ShortcutActionId,
} from "../../../../../lib/workspace-shortcuts/contract.ts";
import { AuthenticatedFeatureScope } from "../../../../_components/authenticated-feature-scope.tsx";
import { useStableFocusedShortcutTarget } from "../../../../_components/workspace/keyboard-shortcuts/use-stable-focused-shortcut-target.ts";
import type { DashboardSectionState } from "../dashboard-view.tsx";

const CUSTOMERS_FEATURE_ID = "master-data.customers";
const COMPANIES_FEATURE_ID = "master-data.companies";

type EntityKind = "customers" | "companies";

type DashboardEntityDirectoryPanelProps = {
  activeEntity: EntityKind;
  canWrite: boolean;
  context: MetadataRenderContext;
  customizationLayers?: CustomizationLayerSet | null;
  entityKind: EntityKind;
  metadata: EntityMetadata;
  onFocus: () => void;
  onRowSelect: (row: DashboardTableRow) => void;
  searchPlaceholder: string;
  selectedRowId: string | null;
  state: DashboardSectionState;
  title: string;
};

const DashboardEntityDirectoryPanel = ({
  activeEntity,
  canWrite,
  context,
  customizationLayers,
  entityKind,
  metadata,
  onFocus,
  onRowSelect,
  searchPlaceholder,
  selectedRowId,
  state,
  title,
}: DashboardEntityDirectoryPanelProps): ReactElement => {
  const isActive = activeEntity === entityKind;

  if (state.status === "forbidden") {
    return (
      <EntityMetadataPanel
        context={context}
        customizationLayers={customizationLayers}
        defaultSortColumn={metadata.table?.defaultSort}
        forbidden
        metadata={metadata}
        rows={[]}
        searchPlaceholder={searchPlaceholder}
        title={title}
        totalRecords={0}
      />
    );
  }

  if (state.status === "error") {
    return (
      <EntityMetadataPanel
        context={context}
        customizationLayers={customizationLayers}
        defaultSortColumn={metadata.table?.defaultSort}
        error={state.message}
        metadata={metadata}
        rows={[]}
        searchPlaceholder={searchPlaceholder}
        title={title}
        totalRecords={0}
      />
    );
  }

  return (
    <section
      className="space-y-3"
      onFocusCapture={onFocus}
      onPointerDownCapture={onFocus}
    >
      {isActive && selectedRowId ? (
        <p className="text-muted-foreground text-xs">
          Selected row: press F2 to inspect, F8 to archive when the route is
          exposed.
        </p>
      ) : null}
      <EntityMetadataPanel
        context={context}
        customizationLayers={customizationLayers}
        defaultSortColumn={metadata.table?.defaultSort}
        metadata={metadata}
        onRowClick={onRowSelect}
        pageSize={5}
        rows={state.data.items}
        searchPlaceholder={searchPlaceholder}
        selectedRowId={isActive ? selectedRowId : null}
        title={title}
        totalRecords={state.data.total}
      />
    </section>
  );
};

type CreateFormState = {
  code: string;
  email: string;
  name: string;
};

const emptyCreateForm = (): CreateFormState => ({
  code: "",
  email: "",
  name: "",
});

export type DashboardEntitySectionsProps = {
  companies: {
    canWrite: boolean;
    customizationLayers?: CustomizationLayerSet | null;
    metadata: EntityMetadata;
    state: DashboardSectionState;
    title: string;
  };
  context: MetadataRenderContext;
  customers: {
    canWrite: boolean;
    customizationLayers?: CustomizationLayerSet | null;
    metadata: EntityMetadata;
    state: DashboardSectionState;
    title: string;
  };
};

export function DashboardEntitySections({
  companies,
  context,
  customers,
}: DashboardEntitySectionsProps): ReactElement {
  const router = useRouter();
  const [activeEntity, setActiveEntity] = useState<EntityKind>("customers");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreateFormState>(emptyCreateForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCanWrite =
    activeEntity === "customers" ? customers.canWrite : companies.canWrite;

  const submitCreate = useCallback(async () => {
    if (!activeCanWrite) {
      toast.message(
        "You do not have permission to create records in this section."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint =
        activeEntity === "customers" ? "/api/customers" : "/api/companies";
      const payload =
        activeEntity === "customers"
          ? {
              code: createForm.code.trim(),
              email: createForm.email.trim() || undefined,
              name: createForm.name.trim(),
            }
          : {
              code: createForm.code.trim(),
              name: createForm.name.trim(),
            };

      const response = await fetch(endpoint, {
        body: JSON.stringify(payload),
        headers: withCSRFHeader({
          "content-type": "application/json",
        }),
        method: "POST",
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Unable to create record.");
      }

      toast.message(
        activeEntity === "customers" ? "Customer created." : "Company created."
      );
      setCreateOpen(false);
      setCreateForm(emptyCreateForm());
      router.refresh();
    } catch (error) {
      toast.message(
        error instanceof Error ? error.message : "Unable to create record."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [activeCanWrite, activeEntity, createForm, router]);

  useStableFocusedShortcutTarget((): FocusedShortcutTarget | null => {
    const handlers: Partial<Record<ShortcutActionId, () => void>> = {};

    if (createOpen && activeCanWrite) {
      handlers["crud.save"] = () => {
        void submitCreate();
      };
      handlers["crud.cancel"] = () => {
        setCreateOpen(false);
        setCreateForm(emptyCreateForm());
      };
      handlers["crud.create"] = () => {
        void submitCreate();
      };

      return {
        targetId: `${activeEntity}-create-form`,
        targetType: "form",
        handlers,
      };
    }

    if (activeCanWrite) {
      handlers["crud.create"] = () => {
        setCreateForm(emptyCreateForm());
        setCreateOpen(true);
      };
    }

    if (selectedRowId) {
      handlers["crud.edit"] = () => {
        toast.message(
          "Record update routes are not exposed on the dashboard yet. Use the API or assistant lane."
        );
      };
      handlers["crud.delete"] = () => {
        toast.message(
          "Record archive routes are not exposed on the dashboard yet."
        );
      };
    }

    if (Object.keys(handlers).length === 0) {
      return null;
    }

    return {
      targetId: selectedRowId ?? `${activeEntity}-grid`,
      targetType: selectedRowId ? "record" : "surface",
      handlers,
    };
  }, [activeCanWrite, activeEntity, createOpen, selectedRowId, submitCreate]);

  const handleRowSelect = useCallback(
    (entityKind: EntityKind, row: DashboardTableRow) => {
      if (typeof row.id !== "string" || row.id.length === 0) {
        return;
      }

      setActiveEntity(entityKind);
      setSelectedRowId(row.id);
    },
    []
  );

  return (
    <>
      <AuthenticatedFeatureScope featureId={CUSTOMERS_FEATURE_ID}>
        <DashboardEntityDirectoryPanel
          activeEntity={activeEntity}
          canWrite={customers.canWrite}
          context={context}
          customizationLayers={customers.customizationLayers}
          entityKind="customers"
          metadata={customers.metadata}
          onFocus={() => setActiveEntity("customers")}
          onRowSelect={(row) => handleRowSelect("customers", row)}
          searchPlaceholder={`Search ${customers.title.toLowerCase()}...`}
          selectedRowId={selectedRowId}
          state={customers.state}
          title={customers.title}
        />
      </AuthenticatedFeatureScope>
      <AuthenticatedFeatureScope featureId={COMPANIES_FEATURE_ID}>
        <DashboardEntityDirectoryPanel
          activeEntity={activeEntity}
          canWrite={companies.canWrite}
          context={context}
          customizationLayers={companies.customizationLayers}
          entityKind="companies"
          metadata={companies.metadata}
          onFocus={() => setActiveEntity("companies")}
          onRowSelect={(row) => handleRowSelect("companies", row)}
          searchPlaceholder={`Search ${companies.title.toLowerCase()}...`}
          selectedRowId={selectedRowId}
          state={companies.state}
          title={companies.title}
        />
      </AuthenticatedFeatureScope>

      <Sheet onOpenChange={setCreateOpen} open={createOpen}>
        <SheetContent className="gap-0 sm:max-w-md" side="right">
          <SheetHeader className="border-border border-b pb-4">
            <SheetTitle>
              Create {activeEntity === "customers" ? "customer" : "company"}
            </SheetTitle>
            <SheetDescription>
              Press F3 to save or Escape to cancel while this sheet is open.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="dashboard-create-name">Name</Label>
              <Input
                id="dashboard-create-name"
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                value={createForm.name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dashboard-create-code">Code</Label>
              <Input
                id="dashboard-create-code"
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    code: event.target.value,
                  }))
                }
                value={createForm.code}
              />
            </div>
            {activeEntity === "customers" ? (
              <div className="space-y-2">
                <Label htmlFor="dashboard-create-email">Email</Label>
                <Input
                  id="dashboard-create-email"
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  type="email"
                  value={createForm.email}
                />
              </div>
            ) : null}
          </div>
          <SheetFooter className="border-border border-t px-4 py-4 sm:flex-row sm:justify-end">
            <Button
              disabled={isSubmitting}
              onClick={() => setCreateOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={() => void submitCreate()}
              type="button"
            >
              {isSubmitting ? "Creating..." : "Create record"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
