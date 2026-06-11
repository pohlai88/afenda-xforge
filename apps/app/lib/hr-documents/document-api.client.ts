"use client";

import { documentsManagementApiRoutePaths } from "@repo/features-employee-management-documents-management/contracts";
import { withCSRFHeader } from "../csrf.client.ts";

type DocumentsApiError = {
  error?: string;
  ok?: boolean;
};

const parseApiError = async (response: Response): Promise<string> => {
  try {
    const body = (await response.json()) as DocumentsApiError;
    return body.error ?? `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

export const updateHrDocument = async (input: {
  documentId: string;
  payload: Record<string, unknown>;
}): Promise<void> => {
  const response = await fetch(
    documentsManagementApiRoutePaths.document(input.documentId),
    {
      body: JSON.stringify({
        id: input.documentId,
        ...input.payload,
      }),
      headers: withCSRFHeader({
        "content-type": "application/json",
      }),
      method: "PATCH",
    }
  );

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};

export const deleteHrDocument = async (input: {
  documentId: string;
  reason?: string | null;
}): Promise<void> => {
  const response = await fetch(
    documentsManagementApiRoutePaths.document(input.documentId),
    {
      body: JSON.stringify({
        id: input.documentId,
        reason: input.reason ?? null,
      }),
      headers: withCSRFHeader({
        "content-type": "application/json",
      }),
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};
