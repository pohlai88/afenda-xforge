"use client";

import type { UpdateCustomerBody } from "@repo/features-master-data-customers/contract";
import { customerApiRoutePaths } from "@repo/features-master-data-customers/contract";
import { withCSRFHeader } from "../csrf.client.ts";

const parseApiError = async (response: Response): Promise<string> => {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

export const updateCustomerRecord = async (input: {
  customerId: string;
  payload: UpdateCustomerBody;
}): Promise<void> => {
  const response = await fetch(
    customerApiRoutePaths.customer(input.customerId),
    {
      body: JSON.stringify(input.payload),
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

export const archiveCustomerRecord = async (input: {
  customerId: string;
}): Promise<void> => {
  const response = await fetch(
    customerApiRoutePaths.customer(input.customerId),
    {
      headers: withCSRFHeader(),
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
};
