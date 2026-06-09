import "server-only";

import { randomUUID } from "node:crypto";
import type { CreateCurrencyBody, Currency } from "./contract.ts";
import { runCurrencyAction } from "./execution/index.ts";

export const createCurrency = (input: CreateCurrencyBody): Currency =>
  runCurrencyAction({
    code: input.code.trim(),
    id: randomUUID(),
    name: input.name.trim(),
    status: "active",
  });
