import "server-only";

import type { CreateJobPositionBody, JobPosition } from "./contract.ts";
import { runJobPositionAction } from "./execution/index.ts";
import { createJobPositionRecord } from "./store.ts";

export const createJobPosition = (input: CreateJobPositionBody): JobPosition =>
  runJobPositionAction(createJobPositionRecord(input));
