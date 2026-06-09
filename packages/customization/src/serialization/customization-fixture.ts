import type {
  CustomizationContract,
  CustomizationFixtureContract,
} from "../contracts/customization.contract.ts";
import { customizationFixtureSchema } from "../schemas/customization.schema.ts";

export type CreateCustomizationFixtureInput = {
  customization: CustomizationContract;
  exportedAt: string;
  exportedBy: string;
};

export const createCustomizationFixture = (
  input: CreateCustomizationFixtureInput
): CustomizationFixtureContract =>
  customizationFixtureSchema.parse({
    exportedAt: input.exportedAt,
    exportedBy: input.exportedBy,
    schemaVersion: 1,
    customization: input.customization,
  });

export const parseCustomizationFixture = (
  input: unknown
): CustomizationFixtureContract => customizationFixtureSchema.parse(input);

export const serializeCustomizationFixture = (
  fixture: CustomizationFixtureContract
): string =>
  `${JSON.stringify(customizationFixtureSchema.parse(fixture), null, 2)}\n`;

export const deserializeCustomizationFixture = (
  serialized: string
): CustomizationFixtureContract =>
  parseCustomizationFixture(JSON.parse(serialized));
