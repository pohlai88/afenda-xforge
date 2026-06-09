"use client";

import { createBrowserSupabaseClient } from "@repo/auth/client";
import type { StorageProviderKind } from "@repo/storage/types";
import type { PutBlobResult } from "@vercel/blob";
import { upload } from "@vercel/blob/client";
import type { ChangeEvent, FormEvent, ReactElement } from "react";
import { useRef, useState } from "react";
import { withCSRFHeader } from "../../../../lib/csrf.client.ts";

const SERVER_UPLOAD_LIMIT_BYTES = 4.5 * 1024 * 1024;

const documentCategoryOptions = [
  "employment",
  "identity",
  "qualification",
  "payroll",
  "policy",
  "hr_letter",
  "medical_leave",
  "compliance",
  "training",
  "other",
] as const;

const documentTypeOptions = [
  "offer_letter",
  "appointment_letter",
  "employment_contract",
  "contract_renewal_letter",
  "nric",
  "passport",
  "work_permit",
  "visa",
  "national_id",
  "degree_certificate",
  "professional_certificate",
  "license",
  "training_certificate",
  "bank_form",
  "tax_form",
  "statutory_registration_form",
  "payroll_declaration_reference",
  "employee_handbook_acknowledgment",
  "code_of_conduct_acknowledgment",
  "it_policy_acknowledgment",
  "safety_policy_acknowledgment",
  "confirmation_letter",
  "promotion_letter",
  "transfer_letter",
  "warning_letter",
  "disciplinary_letter",
  "medical_certificate",
  "fitness_certificate",
  "hospitalization_document",
  "maternity_document",
  "consent_form",
  "statutory_declaration",
  "right_to_work_document",
  "regulatory_form",
  "other",
] as const;

const visibilityOptions = ["internal", "restricted", "confidential"] as const;

type DocumentUploadMode = "server" | "client";

type CreatedDocument = {
  id?: string;
  reference?: {
    storagePath?: string | null;
  } | null;
  title?: string;
};

type DocumentsApiError = {
  error?: string;
  ok?: boolean;
};

type UploadProgressState = {
  loaded: number;
  percentage: number;
  total: number;
};

type UploadResultState = {
  documentId?: string;
  note: string;
  storagePath?: string;
  uploadUrl?: string;
};

type DocumentUploadFormProps = {
  requestHeaders: Readonly<Record<string, string>>;
  storageProvider: StorageProviderKind;
};

type DocumentFormState = {
  description: string;
  documentCategory: (typeof documentCategoryOptions)[number];
  documentType: (typeof documentTypeOptions)[number];
  employeeId: string;
  expiresAt: string;
  fileName: string;
  issuedAt: string;
  legalEntityCode: string;
  mandatory: boolean;
  renewalDueAt: string;
  title: string;
  visibility: (typeof visibilityOptions)[number];
};

const initialFormState: DocumentFormState = {
  description: "",
  documentCategory: "employment",
  documentType: "employment_contract",
  employeeId: "",
  expiresAt: "",
  fileName: "",
  issuedAt: "",
  legalEntityCode: "",
  mandatory: true,
  renewalDueAt: "",
  title: "",
  visibility: "internal",
};

const appendOptionalField = (
  formData: FormData,
  key: string,
  value: string | boolean | undefined
): void => {
  if (typeof value === "boolean") {
    formData.set(key, value ? "true" : "false");
    return;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    formData.set(key, value.trim());
  }
};

const sanitizeBlobPathSegment = (value: string): string =>
  value
    .trim()
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");

const buildBlobPath = (
  employeeId: string,
  fileName: string,
  tenantId?: string
): string => {
  const baseName = sanitizeBlobPathSegment(
    fileName.replace(/\.[^.]+$/, "") || "document"
  );
  const extension = fileName.includes(".")
    ? `.${fileName.split(".").pop() ?? ""}`
    : "";

  return [
    "hr",
    "documents",
    tenantId?.trim() || "unscoped",
    employeeId.trim() || "unscoped",
    `${Date.now()}-${baseName || "document"}${extension}`,
  ].join("/");
};

const toErrorMessage = (value: unknown): string =>
  value instanceof Error ? value.message : "The upload failed.";

const toFormData = (state: DocumentFormState): FormData => {
  const formData = new FormData();

  formData.set("employeeId", state.employeeId.trim());
  formData.set("title", state.title.trim());
  formData.set("documentCategory", state.documentCategory);
  formData.set("documentType", state.documentType);
  appendOptionalField(formData, "description", state.description);
  appendOptionalField(formData, "legalEntityCode", state.legalEntityCode);
  appendOptionalField(formData, "issuedAt", state.issuedAt);
  appendOptionalField(formData, "expiresAt", state.expiresAt);
  appendOptionalField(formData, "renewalDueAt", state.renewalDueAt);
  appendOptionalField(formData, "visibility", state.visibility);
  appendOptionalField(formData, "mandatory", state.mandatory);

  return formData;
};

const parseCreatedDocument = async (
  response: Response
): Promise<CreatedDocument> => (await response.json()) as CreatedDocument;

type SupabaseUploadSessionResponse = {
  bucket: string;
  path: string;
  provider: "supabase";
  token: string;
  type: "supabase.generate-client-upload-session";
};

type R2UploadSessionResponse = {
  bucket: string;
  key: string;
  provider: "r2";
  type: "r2.generate-client-upload-session";
  uploadUrl: string;
};

type StorageUploadSessionResponse =
  | SupabaseUploadSessionResponse
  | R2UploadSessionResponse;

const buildClientUploadPayload = (
  state: DocumentFormState,
  file: File
): string =>
  JSON.stringify({
    contentType: file.type || undefined,
    description: state.description.trim() || undefined,
    documentCategory: state.documentCategory,
    documentType: state.documentType,
    employeeId: state.employeeId.trim(),
    expiresAt: state.expiresAt || undefined,
    fileName: file.name,
    issuedAt: state.issuedAt || undefined,
    legalEntityCode: state.legalEntityCode.trim() || undefined,
    mandatory: state.mandatory,
    renewalDueAt: state.renewalDueAt || undefined,
    sizeBytes: file.size,
    title: state.title.trim(),
    visibility: state.visibility,
  });

const buildRegistrationFormData = ({
  file,
  formState,
  storagePath,
}: {
  file: File;
  formState: DocumentFormState;
  storagePath: string;
}): FormData => {
  const metadata = toFormData(formState);

  metadata.set("contentType", file.type || "application/octet-stream");
  metadata.set("fileName", file.name);
  metadata.set("sizeBytes", String(file.size));
  metadata.set("storagePath", storagePath);

  return metadata;
};

const registerUploadedDocument = async ({
  file,
  formState,
  requestHeaders,
  storagePath,
}: {
  file: File;
  formState: DocumentFormState;
  requestHeaders: Readonly<Record<string, string>>;
  storagePath: string;
}): Promise<CreatedDocument> => {
  const response = await fetch("/api/hr/documents", {
    body: buildRegistrationFormData({ file, formState, storagePath }),
    headers: withCSRFHeader(requestHeaders),
    method: "POST",
  });
  const payload = await parseCreatedDocument(response);

  if (!response.ok) {
    const errorPayload = payload as DocumentsApiError;
    throw new Error(
      errorPayload.error ??
        `Document registration failed with status ${response.status}.`
    );
  }

  return payload;
};

const requestStorageUploadSession = async ({
  file,
  formState,
  requestHeaders,
  storagePath,
}: {
  file: File;
  formState: DocumentFormState;
  requestHeaders: Readonly<Record<string, string>>;
  storagePath: string;
}): Promise<StorageUploadSessionResponse> => {
  const response = await fetch("/api/hr/documents/upload", {
    body: JSON.stringify({
      payload: {
        clientPayload: buildClientUploadPayload(formState, file),
        contentType: file.type || undefined,
        pathname: storagePath,
        sizeBytes: file.size,
      },
      type: "storage.generate-client-upload-session",
    }),
    headers: withCSRFHeader({
      ...requestHeaders,
      "content-type": "application/json",
    }),
    method: "POST",
  });

  const payload = (await response.json()) as StorageUploadSessionResponse & {
    error?: string;
    ok?: boolean;
  };

  if (!response.ok) {
    throw new Error(
      payload.error ??
        `Object storage upload session failed with status ${response.status}.`
    );
  }

  return payload;
};

const uploadDocumentThroughServer = async ({
  file,
  formState,
  requestHeaders,
}: {
  file: File;
  formState: DocumentFormState;
  requestHeaders: Readonly<Record<string, string>>;
}): Promise<UploadResultState> => {
  const metadata = toFormData(formState);
  metadata.set("file", file);

  const response = await fetch("/api/hr/documents", {
    body: metadata,
    headers: withCSRFHeader(requestHeaders),
    method: "POST",
  });
  const payload = await parseCreatedDocument(response);

  if (!response.ok) {
    const errorPayload = payload as DocumentsApiError;
    throw new Error(
      errorPayload.error ??
        `Server upload failed with status ${response.status}.`
    );
  }

  return {
    documentId: payload.id,
    note: "Document was uploaded through the server route and registered immediately.",
    storagePath: payload.reference?.storagePath ?? undefined,
  };
};

const uploadDocumentThroughBlob = async ({
  file,
  formState,
  requestHeaders,
  setProgress,
}: {
  file: File;
  formState: DocumentFormState;
  requestHeaders: Readonly<Record<string, string>>;
  setProgress: (progress: UploadProgressState) => void;
}): Promise<UploadResultState> => {
  const blobPath = buildBlobPath(
    formState.employeeId,
    file.name,
    requestHeaders["x-tenant-id"]
  );
  const uploadedBlob: PutBlobResult = await upload(blobPath, file, {
    access: "private",
    clientPayload: buildClientUploadPayload(formState, file),
    contentType: file.type || undefined,
    handleUploadUrl: "/api/hr/documents/upload",
    headers: withCSRFHeader(requestHeaders),
    onUploadProgress: ({ loaded, percentage, total }) => {
      setProgress({ loaded, percentage, total });
    },
  });
  const createdDocument = await registerUploadedDocument({
    file,
    formState,
    requestHeaders,
    storagePath: uploadedBlob.pathname,
  });

  return {
    documentId: createdDocument.id,
    note: "Blob upload completed. The document was registered after upload.",
    storagePath: uploadedBlob.pathname,
    uploadUrl: uploadedBlob.url,
  };
};

const uploadDocumentThroughSupabase = async ({
  file,
  formState,
  requestHeaders,
  setProgress,
}: {
  file: File;
  formState: DocumentFormState;
  requestHeaders: Readonly<Record<string, string>>;
  setProgress: (progress: UploadProgressState) => void;
}): Promise<UploadResultState> => {
  const storagePath = buildBlobPath(
    formState.employeeId,
    file.name,
    requestHeaders["x-tenant-id"]
  );
  const session = await requestStorageUploadSession({
    file,
    formState,
    requestHeaders,
    storagePath,
  });

  if (session.provider !== "supabase") {
    throw new Error("Supabase upload session was not returned by the server.");
  }

  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase browser client is unavailable.");
  }

  const { error } = await supabase.storage
    .from(session.bucket)
    .uploadToSignedUrl(session.path, session.token, file, {
      contentType: file.type || undefined,
    });

  if (error) {
    throw new Error(error.message);
  }

  setProgress({
    loaded: file.size,
    percentage: 100,
    total: file.size,
  });

  const createdDocument = await registerUploadedDocument({
    file,
    formState,
    requestHeaders,
    storagePath: session.path,
  });

  return {
    documentId: createdDocument.id,
    note: "Supabase upload completed. The document was registered after upload.",
    storagePath: session.path,
  };
};

const uploadDocumentThroughR2 = async ({
  file,
  formState,
  requestHeaders,
  setProgress,
}: {
  file: File;
  formState: DocumentFormState;
  requestHeaders: Readonly<Record<string, string>>;
  setProgress: (progress: UploadProgressState) => void;
}): Promise<UploadResultState> => {
  const storagePath = buildBlobPath(
    formState.employeeId,
    file.name,
    requestHeaders["x-tenant-id"]
  );
  const session = await requestStorageUploadSession({
    file,
    formState,
    requestHeaders,
    storagePath,
  });

  if (session.provider !== "r2") {
    throw new Error("R2 upload session was not returned by the server.");
  }

  const response = await fetch(session.uploadUrl, {
    body: file,
    headers: {
      "content-type": file.type || "application/octet-stream",
    },
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error(`R2 upload failed with status ${response.status}.`);
  }

  setProgress({
    loaded: file.size,
    percentage: 100,
    total: file.size,
  });

  const createdDocument = await registerUploadedDocument({
    file,
    formState,
    requestHeaders,
    storagePath: session.key,
  });

  return {
    documentId: createdDocument.id,
    note: "R2 upload completed. The document was registered after upload.",
    storagePath: session.key,
  };
};

export function DocumentUploadForm({
  requestHeaders,
  storageProvider,
}: DocumentUploadFormProps): ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formState, setFormState] =
    useState<DocumentFormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<DocumentUploadMode | null>(null);
  const [progress, setProgress] = useState<UploadProgressState | null>(null);
  const [result, setResult] = useState<UploadResultState | null>(null);
  let modeLabel = "Choose a file to start.";

  if (mode === "server") {
    modeLabel = "Server upload path selected.";
  } else if (mode === "client") {
    modeLabel = `Direct ${storageProvider} upload selected.`;
  }

  const updateField = <K extends keyof DocumentFormState>(
    key: K,
    value: DocumentFormState[K]
  ): void => {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const submitUpload = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setError("Choose a file before uploading.");
      return;
    }

    if (!formState.employeeId.trim()) {
      setError("Enter an employee ID before uploading.");
      return;
    }

    if (!formState.title.trim()) {
      setError("Enter a document title before uploading.");
      return;
    }

    setError(null);
    setResult(null);
    setProgress(null);
    setIsSubmitting(true);

    try {
      const isServerUpload = file.size <= SERVER_UPLOAD_LIMIT_BYTES;
      setMode(isServerUpload ? "server" : "client");

      let uploadResult: UploadResultState;

      if (isServerUpload) {
        uploadResult = await uploadDocumentThroughServer({
          file,
          formState,
          requestHeaders,
        });
      } else if (storageProvider === "blob") {
        uploadResult = await uploadDocumentThroughBlob({
          file,
          formState,
          requestHeaders,
          setProgress,
        });
      } else if (storageProvider === "supabase") {
        uploadResult = await uploadDocumentThroughSupabase({
          file,
          formState,
          requestHeaders,
          setProgress,
        });
      } else {
        uploadResult = await uploadDocumentThroughR2({
          file,
          formState,
          requestHeaders,
          setProgress,
        });
      }

      setResult(uploadResult);
    } catch (uploadError) {
      setError(toErrorMessage(uploadError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6 rounded-[var(--radius-xl)] border border-border bg-card/95 p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm uppercase tracking-[0.3em]">
          Upload form
        </p>
        <h2 className="font-semibold text-2xl tracking-tight">
          Register a document
        </h2>
        <p className="max-w-3xl text-muted-foreground text-sm">
          Files at or below the server payload limit use the API upload route.
          Larger files upload directly to the active storage backend, then the
          returned storage path is registered against the document record.
        </p>
      </div>

      <form className="space-y-6" onSubmit={submitUpload}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="space-y-2">
            <span className="block font-medium text-sm">Employee ID</span>
            <input
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm shadow-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                updateField("employeeId", event.target.value)
              }
              placeholder="employee-123"
              value={formState.employeeId}
            />
          </label>

          <label className="space-y-2">
            <span className="block font-medium text-sm">Title</span>
            <input
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm shadow-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                updateField("title", event.target.value)
              }
              placeholder="Signed employment contract"
              value={formState.title}
            />
          </label>

          <label className="space-y-2">
            <span className="block font-medium text-sm">File</span>
            <input
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
              className="h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none transition file:mr-4 file:border-0 file:bg-primary file:px-3 file:py-1.5 file:font-medium file:text-primary-foreground file:text-sm hover:file:opacity-90 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              ref={fileInputRef}
              type="file"
            />
          </label>

          <label className="space-y-2">
            <span className="block font-medium text-sm">Category</span>
            <select
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm shadow-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                updateField(
                  "documentCategory",
                  event.target.value as DocumentFormState["documentCategory"]
                )
              }
              value={formState.documentCategory}
            >
              {documentCategoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="block font-medium text-sm">Type</span>
            <select
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm shadow-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                updateField(
                  "documentType",
                  event.target.value as DocumentFormState["documentType"]
                )
              }
              value={formState.documentType}
            >
              {documentTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="block font-medium text-sm">Visibility</span>
            <select
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm shadow-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                updateField(
                  "visibility",
                  event.target.value as DocumentFormState["visibility"]
                )
              }
              value={formState.visibility}
            >
              {visibilityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="block font-medium text-sm">Legal entity code</span>
            <input
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm shadow-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                updateField("legalEntityCode", event.target.value)
              }
              placeholder="TH-001"
              value={formState.legalEntityCode}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="block font-medium text-sm">Issued at</span>
            <input
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm shadow-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                updateField("issuedAt", event.target.value)
              }
              type="date"
              value={formState.issuedAt}
            />
          </label>

          <label className="space-y-2">
            <span className="block font-medium text-sm">Expires at</span>
            <input
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm shadow-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                updateField("expiresAt", event.target.value)
              }
              type="date"
              value={formState.expiresAt}
            />
          </label>

          <label className="space-y-2">
            <span className="block font-medium text-sm">Renewal due at</span>
            <input
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm shadow-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                updateField("renewalDueAt", event.target.value)
              }
              type="date"
              value={formState.renewalDueAt}
            />
          </label>
        </div>

        <label className="space-y-2">
          <span className="block font-medium text-sm">Description</span>
          <textarea
            className="min-h-[8rem] w-full rounded-md border border-border bg-background px-4 py-3 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              updateField("description", event.target.value)
            }
            placeholder="Short note about the document or upload"
            value={formState.description}
          />
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-border/70 bg-background/70 px-4 py-3">
          <input
            checked={formState.mandatory}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              updateField("mandatory", event.target.checked)
            }
            type="checkbox"
          />
          <div className="space-y-0.5">
            <span className="block font-medium text-sm">Mandatory</span>
            <p className="text-muted-foreground text-xs">
              Marks this document as required for the employee record.
            </p>
          </div>
        </label>

        <div className="flex flex-col gap-3 border-border border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Uploading..." : "Upload document"}
          </button>

          <div className="text-muted-foreground text-sm">{modeLabel}</div>
        </div>
      </form>

      {progress ? (
        <div className="space-y-2 rounded-lg border border-border/70 bg-background/70 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Upload progress</span>
            <span className="text-muted-foreground">
              {Math.round(progress.percentage)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(progress.percentage, 100)}%` }}
            />
          </div>
          <p className="text-muted-foreground text-xs">
            {progress.loaded.toLocaleString()} /{" "}
            {progress.total.toLocaleString()} bytes
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-destructive text-sm">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 text-sm dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-100">
          <p className="font-medium">Upload completed.</p>
          <p>{result.note}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <p>
              <span className="font-medium">Document ID:</span>{" "}
              {result.documentId ?? "n/a"}
            </p>
            <p>
              <span className="font-medium">Storage path:</span>{" "}
              {result.storagePath ?? "n/a"}
            </p>
            <p>
              <span className="font-medium">Upload URL:</span>{" "}
              {result.uploadUrl ?? "server upload"}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
