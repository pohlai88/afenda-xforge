import "server-only";

import type { CustomizationContract } from "@repo/customization/contracts";

export type DashboardEntityCustomizationLayers = {
  company: CustomizationContract | null;
  tenant: CustomizationContract | null;
};

export type DashboardMetadataCustomizationLayers = {
  companies: DashboardEntityCustomizationLayers;
  customers: DashboardEntityCustomizationLayers;
};

const tenantCustomizationStore = new Map<
  string,
  DashboardMetadataCustomizationLayers
>();

export const loadDashboardMetadataCustomizations = async (
  tenantId: string
): Promise<DashboardMetadataCustomizationLayers> =>
  tenantCustomizationStore.get(tenantId) ?? {
    companies: {
      company: null,
      tenant: null,
    },
    customers: {
      company: null,
      tenant: null,
    },
  };
