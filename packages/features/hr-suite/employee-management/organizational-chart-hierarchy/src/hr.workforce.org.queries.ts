import "server-only";

import type { HrOrgChartNode } from "./hr.workforce.org.contract.ts";
import { hrOrgStore } from "./hr.workforce.org.store.ts";

type HrOrgWindow = {
  rows: readonly HrOrgChartNode[];
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
};

export function loadHrOrgChartTreeNodes(): readonly HrOrgChartNode[] {
  return hrOrgStore.list();
}

export function loadHrOrgOverviewSnapshot(): {
  totalUnits: number;
  totalPositions: number;
  totalVacancies: number;
  totalHeadcount: number;
} {
  const nodes = hrOrgStore.list();
  return {
    totalUnits: nodes.length,
    totalPositions: nodes.length,
    totalVacancies: 0,
    totalHeadcount: nodes.length,
  };
}

export function listHrOrgUnitsWindow(): HrOrgWindow {
  const rows = hrOrgStore.list();
  return {
    rows,
    pageSize: rows.length,
    totalCount: rows.length,
    hasNextPage: false,
  };
}

export function listHrOrgPositionsWindow(): HrOrgWindow {
  const rows = hrOrgStore.list();
  return {
    rows,
    pageSize: rows.length,
    totalCount: rows.length,
    hasNextPage: false,
  };
}

export function listHrOrgReportingLinesWindow(): HrOrgWindow {
  const rows = hrOrgStore.list();
  return {
    rows,
    pageSize: rows.length,
    totalCount: rows.length,
    hasNextPage: false,
  };
}

export function listHrVacantPositionsWindow(): HrOrgWindow {
  return { rows: [], pageSize: 0, totalCount: 0, hasNextPage: false };
}

export function listHrOrgHeadcountWindow(): HrOrgWindow {
  const rows = hrOrgStore.list();
  return {
    rows,
    pageSize: rows.length,
    totalCount: rows.length,
    hasNextPage: false,
  };
}

export function listHrOrgStructureAuditTrailWindow(): HrOrgWindow {
  return { rows: [], pageSize: 0, totalCount: 0, hasNextPage: false };
}
