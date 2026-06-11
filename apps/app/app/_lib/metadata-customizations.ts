import "server-only";

import type { CustomizationContract } from "@repo/customization/contracts";
import { loadDashboardMetadataCustomizations } from "../(authenticated)/dashboard/_customizations.ts";

export type EntityCustomizationLayers = {
  company: CustomizationContract | null;
  tenant: CustomizationContract | null;
};

export type MetadataCustomizationLookup = {
  companyId?: string | null;
  tenantId: string;
};

export const loadEntityMetadataCustomizations = async (
  lookup: MetadataCustomizationLookup
): Promise<EntityCustomizationLayers> => {
  const layers = await loadDashboardMetadataCustomizations(lookup);
  return layers.customers;
};
