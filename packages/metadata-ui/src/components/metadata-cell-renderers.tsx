import type { ReactElement } from "react";

export {
  renderMetadataTableCell,
  renderMetadataTableCellResult,
} from "../adapters/ui-table-cell-adapter";

import type { MetadataRenderContext } from "../contracts/render-context.contract";
import { renderMetadataTableCellStatus } from "../renderers/fields/field-table-cell-display";

export {
  renderMetadataTableCellStatus,
  resolveStatusTone,
} from "../renderers/fields/field-table-cell-display";

export const renderMetadataStatus = (
  value: string,
  label = value
): ReactElement => renderMetadataTableCellStatus(value, label);

export type MetadataTableCellRenderContext = Pick<
  MetadataRenderContext,
  "locale" | "timezone"
>;
