import {
  listDocumentsManagementDocumentSummaries,
  registerDocumentsManagementDocument,
} from "@repo/features-employee-management-documents-management";
import { registerDocumentsManagementDocumentInputSchema } from "@repo/features-employee-management-documents-management/contracts";
import { NextResponse } from "next/server";

import {
  createDocumentsManagementReadContext,
  createDocumentsManagementWriteContext,
  getDocumentsManagementQuery,
} from "./_lib/context.ts";
import {
  ensureDocumentsManagementReadAccess,
  ensureDocumentsManagementWriteAccess,
} from "./_lib/http.ts";
import {
  DocumentsManagementBlobStorageError,
  uploadDocumentsManagementBlob,
} from "./_lib/storage.ts";

const MAX_SERVER_SIDE_UPLOAD_BYTES = 4.5 * 1024 * 1024;

export async function GET(request: Request): Promise<Response> {
  try {
    const query = getDocumentsManagementQuery(request);
    const context = await createDocumentsManagementReadContext(request);
    const denied = ensureDocumentsManagementReadAccess(context);

    if (denied) {
      return denied;
    }

    return NextResponse.json(
      listDocumentsManagementDocumentSummaries(query, context)
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid query parameters" },
      { status: 400 }
    );
  }
}

const optionalFormValue = (
  formData: FormData,
  key: string
): string | undefined => {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
};

const optionalBooleanFormValue = (
  formData: FormData,
  key: string
): boolean | undefined => {
  const value = optionalFormValue(formData, key);

  if (value === undefined) {
    return;
  }

  if (value === "true" || value === "1") {
    return true;
  }

  if (value === "false" || value === "0") {
    return false;
  }

  throw new Error(`Invalid boolean form field: ${key}`);
};

const optionalNumberFormValue = (
  formData: FormData,
  key: string
): number | undefined => {
  const value = optionalFormValue(formData, key);

  if (value === undefined) {
    return;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`Invalid number form field: ${key}`);
  }

  return parsedValue;
};

const requireFormValue = (formData: FormData, key: string): string => {
  const value = optionalFormValue(formData, key);

  if (!value) {
    throw new Error(`Missing form field: ${key}`);
  }

  return value;
};

const buildDocumentsManagementBlobKey = ({
  employeeId,
  fileName,
  tenantId,
}: {
  readonly employeeId: string;
  readonly fileName: string;
  readonly tenantId?: string;
}): string => {
  const normalizedFileName = fileName
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");

  return [
    "hr",
    "documents",
    tenantId?.trim() || "unscoped",
    employeeId.trim(),
    `${Date.now()}-${normalizedFileName || "document"}`,
  ].join("/");
};

export async function POST(request: Request): Promise<Response> {
  try {
    const writeContext = await createDocumentsManagementWriteContext(request);
    const denied = ensureDocumentsManagementWriteAccess(writeContext);

    if (denied) {
      return denied;
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const uploadedFile = file instanceof File ? file : null;

    if (uploadedFile && uploadedFile.size > MAX_SERVER_SIDE_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Document is too large for server upload. Use the client upload route instead.",
        },
        { status: 413 }
      );
    }

    if (!uploadedFile) {
      const storagePath = optionalFormValue(formData, "storagePath");

      if (!storagePath) {
        return NextResponse.json(
          { ok: false, error: "A file upload or storage path is required" },
          { status: 400 }
        );
      }
    }

    const parsedForm = {
      contentType: optionalFormValue(formData, "contentType"),
      description: optionalFormValue(formData, "description"),
      documentCategory: requireFormValue(formData, "documentCategory"),
      documentType: requireFormValue(formData, "documentType"),
      employeeId: requireFormValue(formData, "employeeId"),
      expiresAt: optionalFormValue(formData, "expiresAt"),
      fileName: optionalFormValue(formData, "fileName"),
      issuedAt: optionalFormValue(formData, "issuedAt"),
      jurisdictionCode: optionalFormValue(formData, "jurisdictionCode"),
      legalEntityCode: optionalFormValue(formData, "legalEntityCode"),
      mandatory: optionalBooleanFormValue(formData, "mandatory"),
      renewalDueAt: optionalFormValue(formData, "renewalDueAt"),
      sizeBytes: optionalNumberFormValue(formData, "sizeBytes"),
      sourceDocumentId: optionalFormValue(formData, "sourceDocumentId"),
      sourceDocumentNumber: optionalFormValue(formData, "sourceDocumentNumber"),
      sourceNotes: optionalFormValue(formData, "sourceNotes"),
      status: optionalFormValue(formData, "status"),
      storagePath: optionalFormValue(formData, "storagePath"),
      title: requireFormValue(formData, "title"),
      visibility: optionalFormValue(formData, "visibility"),
    };
    const shouldUploadFile = uploadedFile !== null;
    const uploadedBlob = shouldUploadFile
      ? await uploadDocumentsManagementBlob({
          body: uploadedFile,
          contentType: uploadedFile.type || undefined,
          key: buildDocumentsManagementBlobKey({
            employeeId: parsedForm.employeeId,
            fileName: uploadedFile.name,
            tenantId: writeContext.tenantId,
          }),
        })
      : null;

    if (shouldUploadFile && !uploadedBlob) {
      return NextResponse.json(
        { ok: false, error: "Document storage is not configured" },
        { status: 503 }
      );
    }

    const storagePath = uploadedBlob?.key ?? parsedForm.storagePath;

    if (!storagePath) {
      return NextResponse.json(
        { ok: false, error: "A file upload or storage path is required" },
        { status: 400 }
      );
    }

    const createdDocument = await registerDocumentsManagementDocument(
      registerDocumentsManagementDocumentInputSchema.parse({
        description: parsedForm.description,
        documentCategory: parsedForm.documentCategory,
        documentType: parsedForm.documentType,
        employeeId: parsedForm.employeeId,
        expiresAt: parsedForm.expiresAt,
        issuedAt: parsedForm.issuedAt,
        jurisdictionCode: parsedForm.jurisdictionCode,
        legalEntityCode: parsedForm.legalEntityCode,
        mandatory: parsedForm.mandatory,
        reference: {
          contentType:
            parsedForm.contentType ??
            uploadedFile?.type ??
            uploadedBlob?.contentType,
          fileName:
            parsedForm.fileName ??
            uploadedFile?.name ??
            storagePath.split("/").at(-1) ??
            undefined,
          sizeBytes:
            parsedForm.sizeBytes ??
            uploadedFile?.size ??
            uploadedBlob?.size ??
            undefined,
          sourceDocumentId: parsedForm.sourceDocumentId,
          sourceDocumentNumber: parsedForm.sourceDocumentNumber,
          sourceNotes: parsedForm.sourceNotes,
          storagePath,
        },
        renewalDueAt: parsedForm.renewalDueAt,
        status: parsedForm.status,
        title: parsedForm.title,
        visibility: parsedForm.visibility,
      }),
      writeContext
    );

    return NextResponse.json(createdDocument, { status: 201 });
  } catch (error) {
    if (error instanceof DocumentsManagementBlobStorageError) {
      return NextResponse.json(
        { ok: false, error: "Document storage is unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { ok: false, error: "Invalid document upload payload" },
      { status: 400 }
    );
  }
}
