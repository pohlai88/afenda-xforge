import { randomUUID } from "node:crypto";
import type {
  HrOrgChartNode,
  UpsertHrOrgPositionInput,
  UpsertHrOrgReportingRelationshipInput,
  UpsertHrOrgUnitInput,
} from "./hr.workforce.org.contract.ts";

type OrgStoreRecord = HrOrgChartNode & {
  createdAt: Date;
  updatedAt: Date;
};

const orgNodes = new Map<string, OrgStoreRecord>();

const now = (): Date => new Date();

const toNode = (record: OrgStoreRecord): HrOrgChartNode => ({
  id: record.id,
  code: record.code,
  name: record.name,
  unitType: record.unitType,
  parentDepartmentId: record.parentDepartmentId,
  managerDisplayName: record.managerDisplayName,
  orgUnitStatus: record.orgUnitStatus,
  childCount: record.childCount,
});

export const hrOrgStore = {
  list(): readonly HrOrgChartNode[] {
    return Array.from(orgNodes.values()).map(toNode);
  },
  get(id: string): OrgStoreRecord | null {
    return orgNodes.get(id) ?? null;
  },
  upsertUnit(input: UpsertHrOrgUnitInput): HrOrgChartNode {
    const id = input.id ?? randomUUID();
    const next: OrgStoreRecord = {
      id,
      code: input.code.trim(),
      name: input.name.trim(),
      unitType: input.unitType,
      parentDepartmentId: input.parentDepartmentId ?? null,
      managerDisplayName: input.managerEmployeeId ?? null,
      orgUnitStatus: input.orgUnitStatus,
      childCount: 0,
      createdAt: now(),
      updatedAt: now(),
    };
    orgNodes.set(id, next);
    return toNode(next);
  },
  upsertPosition(input: UpsertHrOrgPositionInput): HrOrgChartNode {
    const id = input.id ?? randomUUID();
    const next: OrgStoreRecord = {
      id,
      code: input.code.trim(),
      name: input.title.trim(),
      unitType: "department",
      parentDepartmentId: input.departmentId,
      managerDisplayName: input.managerEmployeeId ?? null,
      orgUnitStatus: input.positionStatus,
      childCount: 0,
      createdAt: now(),
      updatedAt: now(),
    };
    orgNodes.set(id, next);
    return toNode(next);
  },
  upsertReportingLine(
    input: UpsertHrOrgReportingRelationshipInput
  ): OrgStoreRecord {
    const id = input.id ?? randomUUID();
    const next: OrgStoreRecord = {
      id,
      code: input.relationshipType.trim(),
      name: input.relationshipType.trim(),
      unitType: "team",
      parentDepartmentId: input.managerEmployeeId,
      managerDisplayName: input.managerEmployeeId,
      orgUnitStatus: "active",
      childCount: 0,
      createdAt: now(),
      updatedAt: now(),
    };
    orgNodes.set(id, next);
    return next;
  },
};
