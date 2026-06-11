"use client";

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
  Textarea,
  toast,
} from "@repo/ui";
import type { ReactElement, ReactNode } from "react";
import { useCallback, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  deleteHrDocument,
  updateHrDocument,
} from "../../../../../../lib/hr-documents/document-api.client.ts";
import type {
  FocusedShortcutTarget,
  ShortcutActionId,
} from "../../../../../../lib/workspace-shortcuts/contract.ts";
import { useStableFocusedShortcutTarget } from "../../../../../_components/workspace/keyboard-shortcuts/use-stable-focused-shortcut-target.ts";

export function DocumentDetailWorkspace({
  canWrite,
  documentDescription,
  documentId,
  documentTitle,
  requestHeaders,
  children,
}: {
  canWrite: boolean;
  documentDescription?: string | null;
  documentId: string;
  documentTitle: string;
  requestHeaders: Readonly<Record<string, string>>;
  children: ReactNode;
}): ReactElement {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [title, setTitle] = useState(documentTitle);
  const [description, setDescription] = useState(documentDescription ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = useCallback(async () => {
    if (!canWrite) {
      toast.message("You do not have permission to edit this document.");
      return;
    }

    setIsSaving(true);

    try {
      await updateHrDocument({
        documentId,
        payload: {
          description:
            description.trim().length > 0 ? description.trim() : null,
          title: title.trim(),
        },
        requestHeaders,
      });
      toast.message("Document updated.");
      setEditOpen(false);
      router.refresh();
    } catch (error) {
      toast.message(
        error instanceof Error ? error.message : "Unable to update document."
      );
    } finally {
      setIsSaving(false);
    }
  }, [canWrite, description, documentId, requestHeaders, router, title]);

  const handleDelete = useCallback(async () => {
    if (!canWrite) {
      toast.message("You do not have permission to delete this document.");
      return;
    }

    setIsDeleting(true);

    try {
      await deleteHrDocument({
        documentId,
        requestHeaders,
      });
      toast.message("Document deleted.");
      router.push("/hr/documents");
    } catch (error) {
      toast.message(
        error instanceof Error ? error.message : "Unable to delete document."
      );
    } finally {
      setIsDeleting(false);
    }
  }, [canWrite, documentId, requestHeaders, router]);

  useStableFocusedShortcutTarget((): FocusedShortcutTarget => {
    const handlers: Partial<Record<ShortcutActionId, () => void>> = {
      "crud.cancel": () => {
        if (editOpen) {
          setEditOpen(false);
          setTitle(documentTitle);
          setDescription(documentDescription ?? "");
          return;
        }

        router.push("/hr/documents");
      },
      "crud.create": () => {
        router.push("/hr/documents");
      },
      "crud.edit": () => {
        if (!canWrite) {
          toast.message("You do not have permission to edit this document.");
          return;
        }

        setEditOpen(true);
      },
      "crud.delete": () => {
        if (!canWrite) {
          toast.message("You do not have permission to delete this document.");
          return;
        }

        handleDelete().catch(() => undefined);
      },
    };

    if (editOpen) {
      handlers["crud.save"] = () => {
        handleSave().catch(() => undefined);
      };
    }

    return {
      targetId: editOpen ? `${documentId}-edit` : documentId,
      targetType: editOpen ? "form" : "record",
      handlers,
    };
  }, [
    canWrite,
    documentDescription,
    documentId,
    documentTitle,
    editOpen,
    handleDelete,
    handleSave,
    router,
  ]);

  return (
    <>
      {children}
      <Sheet onOpenChange={setEditOpen} open={editOpen}>
        <SheetContent className="gap-0 sm:max-w-md" side="right">
          <SheetHeader className="border-border border-b pb-4">
            <SheetTitle>Edit document</SheetTitle>
            <SheetDescription>
              Update title and description. File bytes stay in object storage.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-4 py-6">
            <div className="space-y-2">
              <Label htmlFor="document-edit-title">Title</Label>
              <Input
                id="document-edit-title"
                onChange={(event) => setTitle(event.target.value)}
                value={title}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document-edit-description">Description</Label>
              <Textarea
                id="document-edit-description"
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                value={description}
              />
            </div>
          </div>
          <SheetFooter className="border-border border-t px-4 py-4 sm:flex-row sm:justify-end">
            <Button
              disabled={isSaving}
              onClick={() => setEditOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={isSaving}
              onClick={() => {
                handleSave().catch(() => undefined);
              }}
              type="button"
            >
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      {isDeleting ? (
        <p aria-live="polite" className="sr-only">
          Deleting document...
        </p>
      ) : null}
    </>
  );
}
