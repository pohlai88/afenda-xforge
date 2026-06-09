import {
  createFlexibleWorkArrangementTracking,
  getFlexibleWorkArrangementTracking,
  listFlexibleWorkArrangementTracking,
  updateFlexibleWorkArrangementTracking,
} from "../server.ts";

export type FlexibleWorkArrangementTrackingExecutionSurface = {
  create: typeof createFlexibleWorkArrangementTracking;
  getById: typeof getFlexibleWorkArrangementTracking;
  list: typeof listFlexibleWorkArrangementTracking;
  update: typeof updateFlexibleWorkArrangementTracking;
};

export const flexibleWorkArrangementTrackingExecutionSurface: FlexibleWorkArrangementTrackingExecutionSurface =
  {
    create: createFlexibleWorkArrangementTracking,
    getById: getFlexibleWorkArrangementTracking,
    list: listFlexibleWorkArrangementTracking,
    update: updateFlexibleWorkArrangementTracking,
  };
