import "server-only";

import { randomUUID } from "node:crypto";
import type { CreateProductBody, Product } from "./contract.ts";
import { runProductAction } from "./execution/index.ts";

export const createProduct = (input: CreateProductBody): Product =>
  runProductAction({
    code: input.code.trim(),
    id: randomUUID(),
    name: input.name.trim(),
    status: "active",
  });
