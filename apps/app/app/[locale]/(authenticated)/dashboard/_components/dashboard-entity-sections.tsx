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
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { withCSRFHeader } from "../../../../../lib/csrf.client.ts";
import {
  archiveCompanyRecord,
  updateCompanyRecord,
} from "../../../../../lib/master-data/company-api.client.ts";
import {
  archiveCustomerRecord,
  updateCustomerRecord,
} from "../../../../../lib/master-data/customer-api.client.ts";
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
  canWrite: _canWrite,
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
          Selected row: press F2 to edit
          {entityKind === "customers" || entityKind === "companies"
            ? " or F8 to archive."
            : "."}
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

type RecordSheetMode = "create" | "edit";

const emptyCreateForm = (): CreateFormState => ({
  code: "",
  email: "",
  name: "",
});

const readRowString = (row: DashboardTableRow, key: string): string => {
  const value = row[key];
  return typeof value === "string" ? value : "";
};

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
  const [sheetMode, setSheetMode] = useState<RecordSheetMode>("create");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [recordForm, setRecordForm] =
    useState<CreateFormState>(emptyCreateForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCanWrite =
    activeEntity === "customers" ? customers.canWrite : companies.canWrite;

  const selectedRow = useMemo((): DashboardTableRow | null => {
    if (!selectedRowId) {
      return null;
    }

    const state =
      activeEntity === "customers" ? customers.state : companies.state;

    if (state.status !== "ready") {
      return null;
    }

    return state.data.items.find((row) => row.id === selectedRowId) ?? null;
  }, [activeEntity, companies.state, customers.state, selectedRowId]);

  const openCreateSheet = useCallback(() => {
    setSheetMode("create");
    setRecordForm(emptyCreateForm());
    setSheetOpen(true);
  }, []);

  const openEditSheet = useCallback(() => {
    if (!selectedRow) {
      return;
    }

    setSheetMode("edit");
    setRecordForm({
      code: readRowString(selectedRow, "code"),
      email: readRowString(selectedRow, "email"),
      name: readRowString(selectedRow, "name"),
    });
    setSheetOpen(true);
  }, [selectedRow]);

  const closeRecordSheet = useCallback(() => {
    setSheetOpen(false);
    setRecordForm(emptyCreateForm());
    setSheetMode("create");
  }, []);

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
              code: recordForm.code.trim(),
              email: recordForm.email.trim() || undefined,
              name: recordForm.name.trim(),
            }
          : {
              code: recordForm.code.trim(),
              name: recordForm.name.trim(),
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
      closeRecordSheet();
      router.refresh();
    } catch (error) {
      toast.message(
        error instanceof Error ? error.message : "Unable to create record."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [activeCanWrite, activeEntity, closeRecordSheet, recordForm, router]);

  const submitEdit = useCallback(async () => {
    if (!(activeCanWrite && selectedRowId)) {
      toast.message("You do not have permission to edit this record.");
      return;
    }

    if (activeEntity === "companies") {
      setIsSubmitting(true);

      try {
        await updateCompanyRecord({
          companyId: selectedRowId,
          payload: {
            code: recordForm.code.trim(),
            name: recordForm.name.trim(),
          },
        });

        toast.message("Company updated.");
        closeRecordSheet();
        router.refresh();
      } catch (error) {
        toast.message(
          error instanceof Error ? error.message : "Unable to update record."
        );
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    setIsSubmitting(true);

    try {
      await updateCustomerRecord({
        customerId: selectedRowId,
        payload: {
          code: recordForm.code.trim(),
          email: recordForm.email.trim() || undefined,
          name: recordForm.name.trim(),
        },
      });

      toast.message("Customer updated.");
      closeRecordSheet();
      router.refresh();
    } catch (error) {
      toast.message(
        error instanceof Error ? error.message : "Unable to update record."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    activeCanWrite,
    activeEntity,
    closeRecordSheet,
    recordForm,
    router,
    selectedRowId,
  ]);

  const submitArchive = useCallback(async () => {
    if (!(activeCanWrite && selectedRowId)) {
      toast.message("You do not have permission to archive this record.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (activeEntity === "companies") {
        await archiveCompanyRecord({ companyId: selectedRowId });
        toast.message("Company archived.");
      } else {
        await archiveCustomerRecord({ customerId: selectedRowId });
        toast.message("Customer archived.");
      }

      setSelectedRowId(null);
      router.refresh();
    } catch (error) {
      toast.message(
        error instanceof Error ? error.message : "Unable to archive record."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [activeCanWrite, activeEntity, router, selectedRowId]);

  const submitRecord = useCallback(async () => {
    if (sheetMode === "edit") {
      await submitEdit();
      return;
    }

    await submitCreate();
  }, [sheetMode, submitCreate, submitEdit]);

  const submitButtonLabel = useMemo(() => {
    if (isSubmitting) {
      return sheetMode === "edit" ? "Saving..." : "Creating...";
    }

    return sheetMode === "edit" ? "Save changes" : "Create record";
  }, [isSubmitting, sheetMode]);

  const handleSheetOpenChange = useCallback((open: boolean) => {
    setSheetOpen(open);

    if (!open) {
      setRecordForm(emptyCreateForm());
      setSheetMode("create");
    }
  }, []);

  useStableFocusedShortcutTarget((): FocusedShortcutTarget | null => {
    const handlers: Partial<Record<ShortcutActionId, () => void>> = {};

    if (sheetOpen && activeCanWrite) {
      handlers["crud.save"] = () => {
        submitRecord().catch(() => undefined);
      };
      handlers["crud.cancel"] = () => {
        closeRecordSheet();
      };
      handlers["crud.create"] = () => {
        submitRecord().catch(() => undefined);
      };

      return {
        targetId: `${activeEntity}-${sheetMode}-form`,
        targetType: "form",
        handlers,
      };
    }

    if (activeCanWrite) {
      handlers["crud.create"] = () => {
        openCreateSheet();
      };
    }

    if (selectedRowId && activeCanWrite) {
      handlers["crud.edit"] = () => {
        openEditSheet();
      };
      handlers["crud.delete"] = () => {
        submitArchive().catch(() => undefined);
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
  }, [
    activeCanWrite,
    activeEntity,
    closeRecordSheet,
    openCreateSheet,
    openEditSheet,
    selectedRowId,
    sheetMode,
    sheetOpen,
    submitArchive,
    submitRecord,
  ]);

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

      <Sheet onOpenChange={handleSheetOpenChange} open={sheetOpen}>
        <SheetContent className="gap-0 sm:max-w-md" side="right">
          <SheetHeader className="border-border border-b pb-4">
            <SheetTitle>
              {sheetMode === "edit" ? "Edit" : "Create"}{" "}
              {activeEntity === "customers" ? "customer" : "company"}
            </SheetTitle>
            <SheetDescription>
              Press F3 to save or Escape to cancel while this sheet is open.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="dashboard-record-name">Name</Label>
              <Input
                id="dashboard-record-name"
                onChange={(event) =>
                  setRecordForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                value={recordForm.name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dashboard-record-code">Code</Label>
              <Input
                id="dashboard-record-code"
                onChange={(event) =>
                  setRecordForm((current) => ({
                    ...current,
                    code: event.target.value,
                  }))
                }
                value={recordForm.code}
              />
            </div>
            {activeEntity === "customers" ? (
              <div className="space-y-2">
                <Label htmlFor="dashboard-record-email">Email</Label>
                <Input
                  id="dashboard-record-email"
                  onChange={(event) =>
                    setRecordForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  type="email"
                  value={recordForm.email}
                />
              </div>
            ) : null}
          </div>
          <SheetFooter className="border-border border-t px-4 py-4 sm:flex-row sm:justify-end">
            <Button
              disabled={isSubmitting}
              onClick={closeRecordSheet}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={() => {
                submitRecord().catch(() => undefined);
              }}
              type="button"
            >
              {submitButtonLabel}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
