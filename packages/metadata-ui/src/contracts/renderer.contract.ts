import type { ReactElement } from "react";

import type { MetadataDiagnostic } from "./diagnostics.contract";
import type { MetadataGovernancePolicy } from "./governance.contract";
import type { MetadataRenderContext } from "./render-context.contract";

export type MetadataRendererContract<TContract> = {
  contract: TContract;
  context: MetadataRenderContext;
  diagnostics?: readonly MetadataDiagnostic[];
};

export type MetadataRenderer<TContract> = (
  props: MetadataRendererContract<TContract>
) => ReactElement | null;

export type MetadataRendererDefinition<TContract> = {
  key: string;
  version: string;
  renderer: MetadataRenderer<TContract>;

  governance?: MetadataGovernancePolicy;

  capabilities?: readonly string[];
  deprecated?: boolean;
  experimental?: boolean;
  featureId?: string;
  moduleId?: string;
  ownerPackage?: string;
  priority?: number;
  supports?: (contract: TContract, context: MetadataRenderContext) => boolean;
};
