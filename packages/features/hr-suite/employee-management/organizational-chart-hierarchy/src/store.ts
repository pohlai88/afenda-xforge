import { randomUUID } from "node:crypto";
import type {
  HrOrgAuditEvent,
  HrOrgPositionRecord,
  HrOrgReportingRelationshipRecord,
  HrOrgUnitRecord,
  HrOrgWriteContext,
} from "./contracts/domain.contract.ts";
import type {
  HrOrgAuditTrailListRow,
  HrOrgChartNode,
  HrOrgHeadcountListRow,
  HrOrgPositionListRow,
  HrOrgReportingRelationshipListRow,
  HrOrgUnitListRow,
  HrOrgVacancyListRow,
  UpsertHrOrgPositionInput,
  UpsertHrOrgReportingRelationshipInput,
  UpsertHrOrgUnitInput,
} from "./contracts/org-model.contract.ts";
import type {
  HrOrgAuditEventProjection,
  HrOrgPositionProjection,
  HrOrgReportingRelationshipProjection,
  HrOrgUnitProjection,
} from "./contracts/projection.contract.ts";
import { hrOrgAuditActions } from "./execution/event.ts";
import { createHrOrgMutationAuditEvent } from "./execution.ts";

const units = new Map<string, HrOrgUnitRecord>();
const positions = new Map<string, HrOrgPositionRecord>();
const reportingRelationships = new Map<
  string,
  HrOrgReportingRelationshipRecord
>();
const auditEvents: HrOrgAuditEvent[] = [];

const now = (): Date => new Date();

const cloneDate = (value: Date): Date => new Date(value.getTime());

const normalizeRequiredText = (value: string, fieldName: string): string => {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`${fieldName} is required`);
  }
  return trimmed;
};

const normalizeOptionalText = (
  value: string | null | undefined,
  fieldName: string
): string | null | undefined => {
  if (value === undefined) {
    return;
  }
  if (value === null) {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`${fieldName} cannot be blank`);
  }
  return trimmed;
};

const normalizeDate = (value: Date | string, fieldName: string): Date => {
  const date = value instanceof Date ? cloneDate(value) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid date`);
  }
  return date;
};

const resolveEffectiveFrom = (
  value: Date | string | null | undefined,
  fallback: Date
): Date => {
  if (value === undefined) {
    return cloneDate(fallback);
  }
  if (value === null) {
    throw new Error("effectiveFrom cannot be null");
  }
  return normalizeDate(value, "effectiveFrom");
};

const resolveOptionalDate = (
  value: Date | string | null | undefined,
  fallback: Date | null
): Date | null => {
  if (value === undefined) {
    return fallback === null ? null : cloneDate(fallback);
  }
  if (value === null) {
    return null;
  }
  return normalizeDate(value, "effectiveTo");
};

const resolveOptionalText = (
  value: string | null | undefined,
  fallback: string | null
): string | null => {
  const normalized = normalizeOptionalText(value, "optional text");
  if (normalized === undefined) {
    return fallback;
  }
  return normalized;
};

const ensureUnitExists = (unitId: string): void => {
  if (!units.has(unitId)) {
    throw new Error(`Organization unit "${unitId}" does not exist`);
  }
};

const ensureParentUnitIsValid = (
  unitId: string,
  parentUnitId: string
): void => {
  if (unitId === parentUnitId) {
    throw new Error("An organization unit cannot be its own parent");
  }

  ensureUnitExists(parentUnitId);

  const visited = new Set<string>([unitId]);
  let currentParentId: string | null | undefined = parentUnitId;

  while (currentParentId) {
    if (visited.has(currentParentId)) {
      throw new Error("Organization unit hierarchy cannot contain a cycle");
    }

    visited.add(currentParentId);
    currentParentId = units.get(currentParentId)?.parentUnitId;
  }
};

const sortBy = <T>(rows: readonly T[], selector: (row: T) => string): T[] =>
  [...rows].sort((left, right) =>
    selector(left).localeCompare(selector(right), "en", {
      numeric: true,
      sensitivity: "base",
    })
  );

const toChartNode = (unit: HrOrgUnitRecord): HrOrgChartNode => ({
  id: unit.id,
  code: unit.code,
  name: unit.name,
  unitType: unit.unitType,
  parentUnitId: unit.parentUnitId ?? null,
  managerEmployeeId: unit.managerEmployeeId ?? null,
  status: unit.status,
  childCount: 0,
});

const toUnitProjection = (unit: HrOrgUnitRecord): HrOrgUnitProjection => ({
  id: unit.id,
  code: unit.code,
  name: unit.name,
  unitType: unit.unitType,
  parentUnitId: unit.parentUnitId,
  managerEmployeeId: unit.managerEmployeeId,
  costCenterCode: unit.costCenterCode,
  locationCode: unit.locationCode,
  legalEntityCode: unit.legalEntityCode,
  status: unit.status,
  effectiveFrom: cloneDate(unit.effectiveFrom),
  effectiveTo: unit.effectiveTo ? cloneDate(unit.effectiveTo) : null,
});

const toPositionProjection = (
  position: HrOrgPositionRecord
): HrOrgPositionProjection => ({
  id: position.id,
  code: position.code,
  title: position.title,
  organizationUnitId: position.organizationUnitId,
  managerEmployeeId: position.managerEmployeeId,
  costCenterCode: position.costCenterCode,
  locationCode: position.locationCode,
  status: position.status,
  effectiveFrom: cloneDate(position.effectiveFrom),
  effectiveTo: position.effectiveTo ? cloneDate(position.effectiveTo) : null,
});

const toReportingRelationshipProjection = (
  relationship: HrOrgReportingRelationshipRecord
): HrOrgReportingRelationshipProjection => ({
  id: relationship.id,
  employeeId: relationship.employeeId,
  managerEmployeeId: relationship.managerEmployeeId,
  relationshipType: relationship.relationshipType,
  effectiveFrom: cloneDate(relationship.effectiveFrom),
  effectiveTo: relationship.effectiveTo
    ? cloneDate(relationship.effectiveTo)
    : null,
  reason: relationship.reason ?? null,
});

const toAuditEventProjection = (
  event: HrOrgAuditEvent
): HrOrgAuditEventProjection => ({
  id: event.id,
  actorId: event.actorId,
  action: event.action,
  entityType: event.entityType,
  entityId: event.entityId,
  summary: event.summary,
  reason: event.reason,
  metadata: event.metadata,
  createdAt: cloneDate(event.createdAt),
});

const toChartNodes = (): HrOrgChartNode[] => {
  const childCounts = new Map<string, number>();

  for (const unit of units.values()) {
    if (unit.parentUnitId) {
      childCounts.set(
        unit.parentUnitId,
        (childCounts.get(unit.parentUnitId) ?? 0) + 1
      );
    }
  }

  return sortBy(
    Array.from(units.values()),
    (unit) => `${unit.code}:${unit.name}:${unit.id}`
  ).map((unit) => ({
    ...toChartNode(unit),
    childCount: childCounts.get(unit.id) ?? 0,
  }));
};

const toVacancyRows = (): HrOrgVacancyListRow[] =>
  sortBy(
    Array.from(positions.values()).filter(
      (position) => position.status !== "active"
    ),
    (position) => `${position.code}:${position.title}:${position.id}`
  ).map((position) => ({
    code: position.code,
    effectiveFrom: cloneDate(position.effectiveFrom),
    effectiveTo: position.effectiveTo ? cloneDate(position.effectiveTo) : null,
    organizationUnitId: position.organizationUnitId,
    positionId: position.id,
    status: position.status,
    title: position.title,
  }));

const toHeadcountRows = (): HrOrgHeadcountListRow[] => {
  const positionsByUnit = new Map<
    string,
    { active: number; total: number; vacant: number }
  >();

  for (const position of positions.values()) {
    const current = positionsByUnit.get(position.organizationUnitId) ?? {
      active: 0,
      total: 0,
      vacant: 0,
    };

    current.total += 1;
    if (position.status === "active") {
      current.active += 1;
    } else {
      current.vacant += 1;
    }

    positionsByUnit.set(position.organizationUnitId, current);
  }

  return sortBy(
    Array.from(units.values()),
    (unit) => `${unit.code}:${unit.name}:${unit.id}`
  ).map((unit) => {
    const counts = positionsByUnit.get(unit.id) ?? {
      active: 0,
      total: 0,
      vacant: 0,
    };

    return {
      organizationUnitId: unit.id,
      code: unit.code,
      name: unit.name,
      activePositionCount: counts.active,
      positionCount: counts.total,
      vacantPositionCount: counts.vacant,
    };
  });
};

const appendAuditEvent = (event: HrOrgAuditEvent): void => {
  auditEvents.push(event);
};

export const hrOrgStore = {
  list(): readonly HrOrgChartNode[] {
    return toChartNodes();
  },
  listUnits(): readonly HrOrgUnitListRow[] {
    return sortBy(
      Array.from(units.values()),
      (unit) => `${unit.code}:${unit.name}:${unit.id}`
    ).map(toUnitProjection);
  },
  listPositions(): readonly HrOrgPositionListRow[] {
    return sortBy(
      Array.from(positions.values()),
      (position) => `${position.code}:${position.title}:${position.id}`
    ).map(toPositionProjection);
  },
  listReportingRelationships(): readonly HrOrgReportingRelationshipListRow[] {
    return sortBy(
      Array.from(reportingRelationships.values()),
      (relationship) =>
        `${relationship.employeeId}:${relationship.managerEmployeeId}:${relationship.id}`
    ).map(toReportingRelationshipProjection);
  },
  listVacancies(): readonly HrOrgVacancyListRow[] {
    return toVacancyRows();
  },
  listHeadcount(): readonly HrOrgHeadcountListRow[] {
    return toHeadcountRows();
  },
  listAuditEvents(): readonly HrOrgAuditTrailListRow[] {
    return [...auditEvents]
      .sort((left, right) => {
        const createdAtDelta =
          right.createdAt.getTime() - left.createdAt.getTime();
        if (createdAtDelta !== 0) {
          return createdAtDelta;
        }

        return right.id.localeCompare(left.id, "en", {
          numeric: true,
          sensitivity: "base",
        });
      })
      .map(toAuditEventProjection);
  },
  get(
    id: string
  ):
    | HrOrgUnitRecord
    | HrOrgPositionRecord
    | HrOrgReportingRelationshipRecord
    | null {
    return (
      units.get(id) ??
      positions.get(id) ??
      reportingRelationships.get(id) ??
      null
    );
  },
  upsertUnit(
    input: UpsertHrOrgUnitInput,
    context?: HrOrgWriteContext
  ): HrOrgChartNode {
    const id = input.id ?? randomUUID();
    const existing = units.get(id);
    const parentUnitId = resolveOptionalText(
      input.parentUnitId,
      existing?.parentUnitId ?? null
    );

    if (parentUnitId) {
      ensureParentUnitIsValid(id, parentUnitId);
    }

    const next: HrOrgUnitRecord = {
      id,
      tenantId: existing?.tenantId ?? context?.tenantId ?? null,
      companyId:
        input.companyId ?? existing?.companyId ?? context?.companyId ?? null,
      code: normalizeRequiredText(input.code, "code"),
      name: normalizeRequiredText(input.name, "name"),
      unitType: input.unitType,
      parentUnitId,
      managerEmployeeId: resolveOptionalText(
        input.managerEmployeeId,
        existing?.managerEmployeeId ?? null
      ),
      costCenterCode: resolveOptionalText(
        input.costCenterCode,
        existing?.costCenterCode ?? null
      ),
      locationCode: resolveOptionalText(
        input.locationCode,
        existing?.locationCode ?? null
      ),
      legalEntityCode: resolveOptionalText(
        input.legalEntityCode,
        existing?.legalEntityCode ?? null
      ),
      status: input.status,
      effectiveFrom: resolveEffectiveFrom(
        input.effectiveFrom,
        existing?.effectiveFrom ?? now()
      ),
      effectiveTo: resolveOptionalDate(
        input.effectiveTo,
        existing?.effectiveTo ?? null
      ),
      createdAt: existing?.createdAt ? cloneDate(existing.createdAt) : now(),
      updatedAt: now(),
    };

    units.set(id, next);

    appendAuditEvent(
      createHrOrgMutationAuditEvent(
        {
          action: existing
            ? hrOrgAuditActions.unit.updated
            : hrOrgAuditActions.unit.created,
          entityType: "organization_unit",
          entityId: id,
          summary: `Organization unit ${existing ? "updated" : "created"}: ${next.code}`,
          metadata: {
            code: next.code,
            unitType: next.unitType,
            status: next.status,
            parentUnitId: next.parentUnitId,
            effectiveFrom: next.effectiveFrom.toISOString(),
            effectiveTo: next.effectiveTo?.toISOString() ?? null,
          },
        },
        context
      )
    );

    return toChartNode(next);
  },
  upsertPosition(
    input: UpsertHrOrgPositionInput,
    context?: HrOrgWriteContext
  ): HrOrgChartNode {
    const id = input.id ?? randomUUID();
    const existing = positions.get(id);
    const organizationUnitId = normalizeRequiredText(
      input.organizationUnitId,
      "organizationUnitId"
    );

    ensureUnitExists(organizationUnitId);

    const next: HrOrgPositionRecord = {
      id,
      tenantId: existing?.tenantId ?? context?.tenantId ?? null,
      companyId:
        input.companyId ?? existing?.companyId ?? context?.companyId ?? null,
      code: normalizeRequiredText(input.code, "code"),
      title: normalizeRequiredText(input.title, "title"),
      organizationUnitId,
      managerEmployeeId: resolveOptionalText(
        input.managerEmployeeId,
        existing?.managerEmployeeId ?? null
      ),
      costCenterCode: resolveOptionalText(
        input.costCenterCode,
        existing?.costCenterCode ?? null
      ),
      locationCode: resolveOptionalText(
        input.locationCode,
        existing?.locationCode ?? null
      ),
      status: input.status,
      effectiveFrom: resolveEffectiveFrom(
        input.effectiveFrom,
        existing?.effectiveFrom ?? now()
      ),
      effectiveTo: resolveOptionalDate(
        input.effectiveTo,
        existing?.effectiveTo ?? null
      ),
      createdAt: existing?.createdAt ? cloneDate(existing.createdAt) : now(),
      updatedAt: now(),
    };

    positions.set(id, next);

    appendAuditEvent(
      createHrOrgMutationAuditEvent(
        {
          action: existing
            ? hrOrgAuditActions.position.updated
            : hrOrgAuditActions.position.created,
          entityType: "position",
          entityId: id,
          summary: `Position ${existing ? "updated" : "created"}: ${next.title}`,
          metadata: {
            code: next.code,
            title: next.title,
            organizationUnitId: next.organizationUnitId,
            status: next.status,
            effectiveFrom: next.effectiveFrom.toISOString(),
            effectiveTo: next.effectiveTo?.toISOString() ?? null,
          },
        },
        context
      )
    );

    return toChartNode({
      id: next.id,
      tenantId: next.tenantId,
      companyId: next.companyId,
      code: next.code,
      name: next.title,
      unitType: "department",
      parentUnitId: next.organizationUnitId,
      managerEmployeeId: next.managerEmployeeId,
      costCenterCode: next.costCenterCode,
      locationCode: next.locationCode,
      legalEntityCode: null,
      status: next.status,
      effectiveFrom: next.effectiveFrom,
      effectiveTo: next.effectiveTo,
      createdAt: next.createdAt,
      updatedAt: next.updatedAt,
    } as HrOrgUnitRecord);
  },
  upsertReportingLine(
    input: UpsertHrOrgReportingRelationshipInput,
    context?: HrOrgWriteContext
  ): HrOrgChartNode {
    const id = input.id ?? randomUUID();
    const existing = reportingRelationships.get(id);
    const employeeId = normalizeRequiredText(input.employeeId, "employeeId");
    const managerEmployeeId = normalizeRequiredText(
      input.managerEmployeeId,
      "managerEmployeeId"
    );

    if (employeeId === managerEmployeeId) {
      throw new Error(
        "A reporting relationship cannot point to the same employee"
      );
    }

    const next: HrOrgReportingRelationshipRecord = {
      id,
      tenantId: existing?.tenantId ?? context?.tenantId ?? null,
      companyId:
        input.companyId ?? existing?.companyId ?? context?.companyId ?? null,
      employeeId,
      managerEmployeeId,
      relationshipType: input.relationshipType,
      effectiveFrom: resolveEffectiveFrom(
        input.effectiveFrom,
        existing?.effectiveFrom ?? now()
      ),
      effectiveTo: resolveOptionalDate(
        input.effectiveTo,
        existing?.effectiveTo ?? null
      ),
      reason: resolveOptionalText(input.reason, existing?.reason ?? null),
      createdAt: existing?.createdAt ? cloneDate(existing.createdAt) : now(),
      updatedAt: now(),
    };

    reportingRelationships.set(id, next);

    appendAuditEvent(
      createHrOrgMutationAuditEvent(
        {
          action: hrOrgAuditActions.reportingLine.recorded,
          entityType: "reporting_relationship",
          entityId: id,
          summary: `Reporting relationship recorded: ${next.employeeId} -> ${next.managerEmployeeId}`,
          metadata: {
            employeeId: next.employeeId,
            managerEmployeeId: next.managerEmployeeId,
            relationshipType: next.relationshipType,
            effectiveFrom: next.effectiveFrom.toISOString(),
            effectiveTo: next.effectiveTo?.toISOString() ?? null,
          },
        },
        context
      )
    );

    return toChartNode({
      id: next.id,
      tenantId: next.tenantId,
      companyId: next.companyId,
      code: next.relationshipType,
      name: next.relationshipType,
      unitType: "team",
      parentUnitId: next.managerEmployeeId,
      managerEmployeeId: next.managerEmployeeId,
      costCenterCode: null,
      locationCode: null,
      legalEntityCode: null,
      status: "active",
      effectiveFrom: next.effectiveFrom,
      effectiveTo: next.effectiveTo,
      createdAt: next.createdAt,
      updatedAt: next.updatedAt,
    } as HrOrgUnitRecord);
  },
  resetForTesting(): void {
    units.clear();
    positions.clear();
    reportingRelationships.clear();
    auditEvents.length = 0;
  },
};
