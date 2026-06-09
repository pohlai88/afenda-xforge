import {
  canWriteDocumentsManagement,
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
  DocumentsManagementBlobStorageError,
  uploadDocumentsManagementBlob,
} from "./_lib/storage.ts";

export function GET(request: Request): Response {
  try {
    const query = getDocumentsManagementQuery(request);

    return NextResponse.json(
      listDocumentsManagementDocumentSummaries(
        query,
        createDocumentsManagementReadContext(request)
      )
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
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "A file upload is required" },
        { status: 400 }
      );
    }

    const parsedForm = {
      description: optionalFormValue(formData, "description"),
      documentCategory: requireFormValue(formData, "documentCategory"),
      documentType: requireFormValue(formData, "documentType"),
      employeeId: requireFormValue(formData, "employeeId"),
      expiresAt: optionalFormValue(formData, "expiresAt"),
      issuedAt: optionalFormValue(formData, "issuedAt"),
      legalEntityCode: optionalFormValue(formData, "legalEntityCode"),
      mandatory: optionalBooleanFormValue(formData, "mandatory"),
      renewalDueAt: optionalFormValue(formData, "renewalDueAt"),
      sourceDocumentId: optionalFormValue(formData, "sourceDocumentId"),
      sourceDocumentNumber: optionalFormValue(formData, "sourceDocumentNumber"),
      sourceNotes: optionalFormValue(formData, "sourceNotes"),
      status: optionalFormValue(formData, "status"),
      title: requireFormValue(formData, "title"),
      visibility: optionalFormValue(formData, "visibility"),
    };
    const writeContext = createDocumentsManagementWriteContext(request);

    if (!canWriteDocumentsManagement(writeContext)) {
      return NextResponse.json(
        { ok: false, error: "Write access denied" },
        { status: 403 }
      );
    }

    const uploadedBlob = await uploadDocumentsManagementBlob({
      body: file,
      contentType: file.type || undefined,
      key: buildDocumentsManagementBlobKey({
        employeeId: parsedForm.employeeId,
        fileName: file.name,
        tenantId: writeContext.tenantId,
      }),
    });

    if (!uploadedBlob) {
      return NextResponse.json(
        { ok: false, error: "Document storage is not configured" },
        { status: 503 }
      );
    }

    const createdDocument = registerDocumentsManagementDocument(
      registerDocumentsManagementDocumentInputSchema.parse({
        description: parsedForm.description,
        documentCategory: parsedForm.documentCategory,
        documentType: parsedForm.documentType,
        employeeId: parsedForm.employeeId,
        expiresAt: parsedForm.expiresAt,
        issuedAt: parsedForm.issuedAt,
        legalEntityCode: parsedForm.legalEntityCode,
        mandatory: parsedForm.mandatory,
        reference: {
          contentType: file.type || uploadedBlob.contentType,
          fileName: file.name,
          sizeBytes: file.size,
          sourceDocumentId: parsedForm.sourceDocumentId,
          sourceDocumentNumber: parsedForm.sourceDocumentNumber,
          sourceNotes: parsedForm.sourceNotes,
          storagePath: uploadedBlob.key,
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
