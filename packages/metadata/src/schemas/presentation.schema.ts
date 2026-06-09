import { z } from "zod";
import { metadataPresentationCustomizationSchema } from "./customization-policy.schema.ts";

export const metadataPresentationSchema = z
  .object({
    customization: metadataPresentationCustomizationSchema.optional(),
    density: z.enum(["comfortable", "compact", "default"]).optional(),
    icon: z.string().trim().min(1).optional(),
    size: z.enum(["icon", "lg", "md", "sm"]).optional(),
    tone: z
      .enum(["destructive", "info", "neutral", "success", "warning"])
      .optional(),
    variant: z
      .enum([
        "default",
        "destructive",
        "ghost",
        "info",
        "link",
        "muted",
        "outline",
        "secondary",
        "success",
        "warning",
      ])
      .optional(),
  })
  .strict();
