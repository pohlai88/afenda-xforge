import type { MetadataFeatureContract } from "../contracts/feature-metadata.contract.ts";
import { metadataFeatureSchema } from "../schemas/feature-metadata.schema.ts";

export const assertMetadataContract = (
  input: unknown
): MetadataFeatureContract => metadataFeatureSchema.parse(input);
