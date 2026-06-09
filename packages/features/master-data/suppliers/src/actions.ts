import "server-only";

import { randomUUID } from "node:crypto";
import type { CreateSupplierBody, Supplier } from "./contract.ts";
import { runSupplierAction } from "./execution/index.ts";

export const createSupplier = (input: CreateSupplierBody): Supplier =>
  runSupplierAction({
    code: input.code.trim(),
    email: input.email?.trim().toLowerCase(),
    id: randomUUID(),
    name: input.name.trim(),
    status: "active",
  });
