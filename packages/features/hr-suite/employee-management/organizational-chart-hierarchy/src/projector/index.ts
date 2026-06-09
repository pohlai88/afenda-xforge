import type {
  HrOrgChartNodeProjection,
  HrOrgOverviewProjection,
} from "../contracts/index.ts";
import {
  hrOrgChartNodeProjectionSchema,
  hrOrgOverviewProjectionSchema,
} from "../contracts/index.ts";

export const projectHrOrgChartNode = (
  node: HrOrgChartNodeProjection
): HrOrgChartNodeProjection => hrOrgChartNodeProjectionSchema.parse(node);

export const projectHrOrgOverview = (
  overview: HrOrgOverviewProjection
): HrOrgOverviewProjection => hrOrgOverviewProjectionSchema.parse(overview);
