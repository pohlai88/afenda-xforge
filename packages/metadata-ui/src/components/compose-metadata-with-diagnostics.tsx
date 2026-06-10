import type { ReactElement } from "react";

import type { MetadataDiagnostic } from "../contracts/diagnostics.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import {
  resolveDiagnosticsEnabledProps,
  shouldSurfaceDiagnostics,
} from "../visualization/diagnostics-visual-contract";
import { MetadataDiagnosticsPanel } from "./metadata-diagnostics-panel";

const cn = (...values: Array<string | false | null | undefined>): string =>
  values.filter(Boolean).join(" ");

export function composeMetadataWithDiagnostics(
  context: MetadataRenderContext,
  element: ReactElement,
  diagnostics: readonly MetadataDiagnostic[]
): ReactElement {
  if (!shouldSurfaceDiagnostics(context, diagnostics)) {
    return element;
  }

  return (
    <div className={cn("space-y-4")} {...resolveDiagnosticsEnabledProps(true)}>
      {element}
      <MetadataDiagnosticsPanel context={context} diagnostics={diagnostics} />
    </div>
  );
}
