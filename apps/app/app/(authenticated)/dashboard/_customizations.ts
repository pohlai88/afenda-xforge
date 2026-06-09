import "server-only";

import type { CustomizationContract } from "@repo/customization/contracts";

export type DashboardCustomizationLookup = {
  companyId?: string | null;
  tenantId: string;
};

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

const getCustomizationLookupKey = ({
  companyId,
  tenantId,
}: DashboardCustomizationLookup): string =>
  companyId ? `${tenantId}:${companyId}` : tenantId;

export const loadDashboardMetadataCustomizations = async (
  lookup: DashboardCustomizationLookup
): Promise<DashboardMetadataCustomizationLayers> =>
  tenantCustomizationStore.get(getCustomizationLookupKey(lookup)) ??
  tenantCustomizationStore.get(lookup.tenantId) ?? {
    companies: {
      company: null,
      tenant: null,
    },
    customers: {
      company: null,
      tenant: null,
    },
  };
