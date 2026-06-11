"use client";

import type { UpdateCompanyBody } from "@repo/features-master-data-companies/contract";
import { companyApiRoutePaths } from "@repo/features-master-data-companies/contract";
import { withCSRFHeader } from "../csrf.client.ts";

const parseApiError = async (response: Response): Promise<string> => {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

export const updateCompanyRecord = async (input: {
  companyId: string;
  payload: UpdateCompanyBody;
}): Promise<void> => {
  const response = await fetch(companyApiRoutePaths.company(input.companyId), {
    body: JSON.stringify(input.payload),
    headers: withCSRFHeader({
      "content-type": "application/json",
    }),
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};
