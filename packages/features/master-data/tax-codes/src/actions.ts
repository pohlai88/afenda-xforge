import "server-only";

import { randomUUID } from "node:crypto";
import type { CreateTaxCodeBody, TaxCode } from "./contract.ts";
import { runTaxCodeAction } from "./execution/index.ts";

export const createTaxCode = (input: CreateTaxCodeBody): TaxCode =>
  runTaxCodeAction({
    code: input.code.trim(),
    id: randomUUID(),
    name: input.name.trim(),
    status: "active",
  });
