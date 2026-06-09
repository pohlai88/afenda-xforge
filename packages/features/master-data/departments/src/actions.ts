import "server-only";

import { randomUUID } from "node:crypto";
import type { CreateDepartmentBody, Department } from "./contract.ts";
import { runDepartmentAction } from "./execution/index.ts";

export const createDepartment = (input: CreateDepartmentBody): Department =>
  runDepartmentAction({
    code: input.code.trim(),
    id: randomUUID(),
    name: input.name.trim(),
    status: "active",
  });
