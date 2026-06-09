import type { CustomizationContract } from "../contracts/customization.contract.ts";
import { customizationSchema } from "../schemas/customization.schema.ts";

export const parseCustomization = (input: unknown): CustomizationContract =>
  customizationSchema.parse(input);
