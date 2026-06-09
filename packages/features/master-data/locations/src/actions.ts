import "server-only";

import { randomUUID } from "node:crypto";
import type { CreateLocationBody, Location } from "./contract.ts";
import { runLocationAction } from "./execution/index.ts";

export const createLocation = (input: CreateLocationBody): Location =>
  runLocationAction({
    code: input.code.trim(),
    id: randomUUID(),
    name: input.name.trim(),
    status: "active",
  });
