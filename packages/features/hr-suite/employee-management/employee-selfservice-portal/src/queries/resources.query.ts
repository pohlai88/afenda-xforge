import "server-only";

import { listDocumentsManagementDocumentSummaries } from "../../../documents-management/src/server.ts";

import { canReadEmployeeSelfservicePortal } from "../policy.ts";
import { projectEmployeeSelfservicePortalDocumentResource } from "../projector/resource.ts";
import { listEmployeeSelfservicePortalRepositoryRecords } from "../repository.ts";
import type {
  EmployeeSelfservicePortalResourceItem,
  ListEmployeeSelfservicePortalResourcesQuery,
} from "../schema.ts";
import {
  employeeSelfservicePortalResourceItemSchema,
  listEmployeeSelfservicePortalResourcesQuerySchema,
} from "../schema.ts";
import type { HrSuiteFeatureContext } from "../shared/index.ts";

const DEFAULT_PAGE_SIZE = 25;
const FAQ_UPDATED_AT = new Date("2026-06-10T00:00:00.000Z");

const FAQ_RESOURCES: readonly EmployeeSelfservicePortalResourceItem[] = [
  {
    acknowledgmentStatus: null,
    body: "Use the profile update request flow when you need to update permitted personal information such as phone number, personal email, address, or emergency contact details.",
    category: "faq",
    documentId: null,
    documentType: null,
    employeeId: null,
    id: "faq:profile-updates",
    mandatory: false,
    policyId: null,
    policyVersion: null,
    source: "employee_selfservice_portal",
    status: "published",
    summary: "Guidance on how employees request approved profile changes.",
    title: "How do I update my personal information?",
    updatedAt: FAQ_UPDATED_AT,
    visibility: "internal",
  },
  {
    acknowledgmentStatus: null,
    body: "Forms and policy resources appear in the self-service portal when they are assigned or published for your employee scope. Check the documents and resource-center views for the latest items.",
    category: "faq",
    documentId: null,
    documentType: null,
    employeeId: null,
    id: "faq:resource-access",
    mandatory: false,
    policyId: null,
    policyVersion: null,
    source: "employee_selfservice_portal",
    status: "published",
    summary: "Explains where policy, handbook, and form resources appear.",
    title: "Where can I find HR policies, handbooks, and forms?",
    updatedAt: FAQ_UPDATED_AT,
    visibility: "internal",
  },
  {
    acknowledgmentStatus: null,
    body: "Required acknowledgments remain pending until you open the acknowledgment list and confirm the item through the self-service portal. HR can track the resulting completion state.",
    category: "faq",
    documentId: null,
    documentType: null,
    employeeId: null,
    id: "faq:policy-acknowledgment",
    mandatory: false,
    policyId: null,
    policyVersion: null,
    source: "employee_selfservice_portal",
    status: "published",
    summary: "Explains how employees complete required policy acknowledgments.",
    title: "How do I acknowledge a required HR notice or policy?",
    updatedAt: FAQ_UPDATED_AT,
    visibility: "internal",
  },
  {
    acknowledgmentStatus: null,
    body: "If a required resource or acknowledgment item is missing, contact HR support with your employee number, tenant, and company context so they can verify your assignment scope.",
    category: "faq",
    documentId: null,
    documentType: null,
    employeeId: null,
    id: "faq:missing-resource",
    mandatory: false,
    policyId: null,
    policyVersion: null,
    source: "employee_selfservice_portal",
    status: "published",
    summary: "Support guidance when an expected HR resource is missing.",
    title: "What should I do if an expected HR resource is missing?",
    updatedAt: FAQ_UPDATED_AT,
    visibility: "internal",
  },
].map((resource) =>
  employeeSelfservicePortalResourceItemSchema.parse(resource)
);

const normalizePositiveInteger = (
  value: number | undefined,
  fallback: number
): number => {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  const parsedValue = Math.floor(value);
  return parsedValue > 0 ? parsedValue : fallback;
};

const normalizeSearchTerm = (value: string | undefined): string =>
  value?.trim().toLowerCase() ?? "";

const hasAccessiblePortalRecord = (
  context: HrSuiteFeatureContext | undefined
): boolean =>
  Boolean(
    context?.actorEmployeeId &&
      listEmployeeSelfservicePortalRepositoryRecords().some(
        (record) =>
          record.employeeId === context.actorEmployeeId &&
          canReadEmployeeSelfservicePortal(context, record)
      )
  );

const matchesSearch = (
  resource: EmployeeSelfservicePortalResourceItem,
  searchTerm: string
): boolean => {
  if (searchTerm.length === 0) {
    return true;
  }

  return [
    resource.body,
    resource.category,
    resource.documentType,
    resource.summary,
    resource.title,
  ].some((value) => value?.toLowerCase().includes(searchTerm) ?? false);
};

export function listEmployeeSelfservicePortalResources(
  query: ListEmployeeSelfservicePortalResourcesQuery = {},
  context?: HrSuiteFeatureContext
): readonly EmployeeSelfservicePortalResourceItem[] {
  const parsedQuery =
    listEmployeeSelfservicePortalResourcesQuerySchema.parse(query);

  if (
    !(
      context?.canRead &&
      context.actorEmployeeId &&
      hasAccessiblePortalRecord(context)
    )
  ) {
    return [];
  }

  const searchTerm = normalizeSearchTerm(parsedQuery.search);
  const page = normalizePositiveInteger(parsedQuery.page, 1);
  const pageSize = normalizePositiveInteger(
    parsedQuery.pageSize,
    DEFAULT_PAGE_SIZE
  );

  const documentResources = listDocumentsManagementDocumentSummaries(
    {
      employeeId: context.actorEmployeeId,
    },
    {
      actorEmployeeId: context.actorEmployeeId,
      actorId: context.actorId,
      canDownload: false,
      canRead: true,
      canSelfAcknowledge: true,
      canViewSensitive: false,
      companyId: context.companyId,
      organizationId: context.organizationId,
      requestId: context.requestId,
      tenantId: context.tenantId,
      userId: context.userId,
    }
  )
    .map((document) =>
      projectEmployeeSelfservicePortalDocumentResource(document)
    )
    .filter((resource): resource is EmployeeSelfservicePortalResourceItem =>
      Boolean(resource)
    );

  const filteredResources = [...documentResources, ...FAQ_RESOURCES]
    .filter((resource) =>
      parsedQuery.category ? resource.category === parsedQuery.category : true
    )
    .filter((resource) => matchesSearch(resource, searchTerm))
    .sort(
      (left, right) =>
        right.updatedAt.getTime() - left.updatedAt.getTime() ||
        left.category.localeCompare(right.category) ||
        left.title.localeCompare(right.title)
    );

  const startIndex = (page - 1) * pageSize;
  return filteredResources.slice(startIndex, startIndex + pageSize);
}
