import { z } from "zod";

import { metadataUiStates } from "../contracts/state.contract.ts";

export const metadataStateSchema = z
  .object({
    key: z.string().trim().min(1),
    label: z.string().trim().min(1),
    description: z.string().trim().min(1).optional(),
    tone: z
      .enum(["neutral", "success", "warning", "destructive", "info"])
      .optional(),
    uiState: z.enum(metadataUiStates),
  })
  .strict();
