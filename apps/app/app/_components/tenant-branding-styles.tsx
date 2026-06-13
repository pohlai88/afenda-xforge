import type { AfendaTenantBrandingSettings as TenantBrandingSettings } from "@repo/design-system/contracts/afenda/customization";
import { renderTenantBrandingStyleBlock } from "@repo/design-system";
import type { ReactElement } from "react";

type TenantBrandingStylesProps = {
  branding: TenantBrandingSettings;
};

export function TenantBrandingStyles({
  branding,
}: TenantBrandingStylesProps): ReactElement {
  const css = renderTenantBrandingStyleBlock(branding);

  return <style>{css}</style>;
}
