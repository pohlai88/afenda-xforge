import type { ReactElement } from "react";

import type { MetadataDiagnostic } from "../contracts/diagnostics.contract";

export type MetadataRenderAdapterResult<TElement = ReactElement | null> = {
  diagnostics: readonly MetadataDiagnostic[];
  element: TElement;
};
