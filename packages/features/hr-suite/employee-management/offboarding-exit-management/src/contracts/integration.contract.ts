import type { z } from "zod";
import type { offboardingLifecycleTriggerSnapshotSchema } from "../schema.ts";

export type OffboardingLifecycleHandoffReference = z.infer<
  typeof offboardingLifecycleTriggerSnapshotSchema
>;
