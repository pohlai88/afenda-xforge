import { z } from "zod";

export const metadataPresentationSchema = z
  .object({
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
