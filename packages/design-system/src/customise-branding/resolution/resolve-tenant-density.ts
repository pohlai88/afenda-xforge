import type { AfendaTenantBrandingSettings } from "../../contracts/afenda/customization/branding.contract";

export type AfendaTenantDensityDataAttribute = {
  readonly "data-density"?: "compact" | "comfortable";
};

export function resolveTenantDensityDataAttribute(
  settings: AfendaTenantBrandingSettings
): AfendaTenantDensityDataAttribute {
  const density = settings.density;

  if (density === "compact" || density === "comfortable") {
    return { "data-density": density };
  }

  return {};
}
