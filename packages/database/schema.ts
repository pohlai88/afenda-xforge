import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const xforge = pgSchema("xforge");

export const tenants = xforge.table(
  "tenants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: varchar("slug", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("tenants_slug_unique").on(table.slug)]
);

export const companies = xforge.table(
  "companies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    code: varchar("code", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("companies_tenant_id_idx").on(table.tenantId),
    uniqueIndex("companies_tenant_code_unique").on(table.tenantId, table.code),
  ]
);

export const customers = xforge.table(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 32 }).notNull(),
    email: text("email"),
    name: text("name").notNull(),
    status: varchar("status", { length: 16 }).notNull().default("active"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("customers_tenant_id_idx").on(table.tenantId),
    index("customers_tenant_status_idx").on(table.tenantId, table.status),
    uniqueIndex("customers_tenant_code_unique").on(table.tenantId, table.code),
  ]
);

export const tenantMemberships = xforge.table(
  "tenant_memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    role: varchar("role", { length: 32 }).notNull().default("member"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("tenant_memberships_tenant_id_idx").on(table.tenantId),
    uniqueIndex("tenant_memberships_tenant_user_unique").on(
      table.tenantId,
      table.userId
    ),
  ]
);

export const companyGrants = xforge.table(
  "company_grants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    grant: varchar("grant", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("company_grants_tenant_id_idx").on(table.tenantId),
    index("company_grants_company_id_idx").on(table.companyId),
    uniqueIndex("company_grants_unique").on(
      table.tenantId,
      table.companyId,
      table.userId,
      table.grant
    ),
  ]
);

export const notificationInbox = xforge.table(
  "notification_inbox",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    notificationId: uuid("notification_id").notNull(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "set null",
    }),
    userId: text("user_id").notNull(),
    event: varchar("event", { length: 128 }).notNull(),
    topic: text("topic").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    dispatchedAt: timestamp("dispatched_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    seenAt: timestamp("seen_at", {
      mode: "date",
      withTimezone: true,
    }),
    readAt: timestamp("read_at", {
      mode: "date",
      withTimezone: true,
    }),
    archivedAt: timestamp("archived_at", {
      mode: "date",
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("notification_inbox_notification_id_idx").on(table.notificationId),
    index("notification_inbox_tenant_user_dispatched_idx").on(
      table.tenantId,
      table.userId,
      table.dispatchedAt
    ),
    index("notification_inbox_tenant_company_user_dispatched_idx").on(
      table.tenantId,
      table.companyId,
      table.userId,
      table.dispatchedAt
    ),
  ]
);

export const webhookEndpoints = xforge.table(
  "webhook_endpoints",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "set null",
    }),
    provider: varchar("provider", { length: 64 }).notNull(),
    endpointId: varchar("endpoint_id", { length: 128 }).notNull(),
    applicationId: text("application_id"),
    applicationName: text("application_name"),
    eventOwner: varchar("event_owner", { length: 128 }).notNull(),
    schemaVersion: varchar("schema_version", { length: 32 }).notNull(),
    secret: text("secret").notNull(),
    status: varchar("status", { length: 16 }).notNull().default("active"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("webhook_endpoints_tenant_id_idx").on(table.tenantId),
    index("webhook_endpoints_tenant_provider_status_idx").on(
      table.tenantId,
      table.provider,
      table.status
    ),
    uniqueIndex("webhook_endpoints_provider_endpoint_unique").on(
      table.provider,
      table.endpointId
    ),
  ]
);

export const complianceObligations = xforge.table(
  "compliance_obligations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    code: varchar("code", { length: 96 }).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    requirementKind: varchar("requirement_kind", { length: 64 }).notNull(),
    severity: varchar("severity", { length: 32 }).notNull(),
    scope: jsonb("scope").$type<Record<string, unknown>>().notNull(),
    expectedEvidenceType: varchar("expected_evidence_type", {
      length: 96,
    }).notNull(),
    initialDueInDays: integer("initial_due_in_days"),
    renewalEveryDays: integer("renewal_every_days"),
    effectiveFrom: timestamp("effective_from", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    effectiveTo: timestamp("effective_to", {
      mode: "date",
      withTimezone: true,
    }),
    active: boolean("active").notNull().default(true),
    jurisdictionSource: text("jurisdiction_source").notNull(),
    version: varchar("version", { length: 64 }).notNull(),
    ownerTeam: text("owner_team"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("compliance_obligations_tenant_company_idx").on(
      table.tenantId,
      table.companyId
    ),
    uniqueIndex("compliance_obligations_tenant_company_code_unique").on(
      table.tenantId,
      table.companyId,
      table.code
    ),
  ]
);

export const complianceWorkerProfiles = xforge.table(
  "compliance_worker_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    employeeId: text("employee_id").notNull(),
    employeeNumber: varchar("employee_number", { length: 96 }).notNull(),
    displayName: text("display_name").notNull(),
    legalEntityCode: varchar("legal_entity_code", { length: 96 }),
    countryCode: varchar("country_code", { length: 8 }),
    workLocationCode: varchar("work_location_code", { length: 96 }),
    employmentType: varchar("employment_type", { length: 96 }),
    workerCategory: varchar("worker_category", { length: 96 }),
    departmentId: text("department_id"),
    hireDate: timestamp("hire_date", { mode: "date", withTimezone: true }),
    terminationDate: timestamp("termination_date", {
      mode: "date",
      withTimezone: true,
    }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("compliance_worker_profiles_tenant_company_idx").on(
      table.tenantId,
      table.companyId
    ),
    uniqueIndex("compliance_worker_profiles_tenant_employee_unique").on(
      table.tenantId,
      table.companyId,
      table.employeeId
    ),
  ]
);

export const complianceEvidenceArtifacts = xforge.table(
  "compliance_evidence_artifacts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    employeeId: text("employee_id").notNull(),
    obligationId: uuid("obligation_id").notNull(),
    requirementId: text("requirement_id"),
    evidenceType: varchar("evidence_type", { length: 96 }).notNull(),
    title: text("title").notNull(),
    sourceDocumentId: text("source_document_id"),
    sourceDocumentNumber: text("source_document_number"),
    sourceNotes: text("source_notes"),
    sensitivity: varchar("sensitivity", { length: 32 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    issuedAt: timestamp("issued_at", { mode: "date", withTimezone: true }),
    expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }),
    verifiedAt: timestamp("verified_at", {
      mode: "date",
      withTimezone: true,
    }),
    verifiedBy: text("verified_by"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("compliance_evidence_tenant_company_employee_idx").on(
      table.tenantId,
      table.companyId,
      table.employeeId
    ),
    index("compliance_evidence_obligation_idx").on(table.obligationId),
  ]
);

export const complianceExceptions = xforge.table(
  "compliance_exceptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    employeeId: text("employee_id").notNull(),
    obligationId: uuid("obligation_id").notNull(),
    requirementId: text("requirement_id").notNull(),
    reason: text("reason").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    ownerId: text("owner_id"),
    dueAt: timestamp("due_at", { mode: "date", withTimezone: true }),
    waiverExpiresAt: timestamp("waiver_expires_at", {
      mode: "date",
      withTimezone: true,
    }),
    approvedBy: text("approved_by"),
    approvedAt: timestamp("approved_at", {
      mode: "date",
      withTimezone: true,
    }),
    resolvedAt: timestamp("resolved_at", {
      mode: "date",
      withTimezone: true,
    }),
    resolutionNotes: text("resolution_notes"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("compliance_exceptions_tenant_company_status_idx").on(
      table.tenantId,
      table.companyId,
      table.status
    ),
    index("compliance_exceptions_requirement_idx").on(table.requirementId),
  ]
);

export const complianceCorrectiveActions = xforge.table(
  "compliance_corrective_actions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    employeeId: text("employee_id").notNull(),
    obligationId: uuid("obligation_id").notNull(),
    requirementId: text("requirement_id").notNull(),
    exceptionId: uuid("exception_id"),
    title: text("title").notNull(),
    description: text("description"),
    ownerId: text("owner_id"),
    status: varchar("status", { length: 32 }).notNull(),
    dueAt: timestamp("due_at", { mode: "date", withTimezone: true }),
    completedAt: timestamp("completed_at", {
      mode: "date",
      withTimezone: true,
    }),
    evidenceIds: jsonb("evidence_ids").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("compliance_corrective_actions_tenant_company_status_idx").on(
      table.tenantId,
      table.companyId,
      table.status
    ),
    index("compliance_corrective_actions_requirement_idx").on(
      table.requirementId
    ),
  ]
);

export const complianceFilings = xforge.table(
  "compliance_filings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    obligationId: uuid("obligation_id").notNull(),
    filingCode: varchar("filing_code", { length: 96 }).notNull(),
    title: text("title").notNull(),
    jurisdictionSource: text("jurisdiction_source").notNull(),
    dueAt: timestamp("due_at", { mode: "date", withTimezone: true }).notNull(),
    submittedAt: timestamp("submitted_at", {
      mode: "date",
      withTimezone: true,
    }),
    submittedBy: text("submitted_by"),
    status: varchar("status", { length: 32 }).notNull(),
    evidenceIds: jsonb("evidence_ids").$type<string[]>().notNull().default([]),
    confirmationReference: text("confirmation_reference"),
    notes: text("notes"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("compliance_filings_tenant_company_status_due_idx").on(
      table.tenantId,
      table.companyId,
      table.status,
      table.dueAt
    ),
    uniqueIndex("compliance_filings_tenant_company_code_unique").on(
      table.tenantId,
      table.companyId,
      table.filingCode
    ),
  ]
);

export const complianceAlertStates = xforge.table(
  "compliance_alert_states",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    alertId: text("alert_id").notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    actorId: text("actor_id"),
    reason: text("reason"),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("compliance_alert_states_tenant_alert_unique").on(
      table.tenantId,
      table.alertId
    ),
    index("compliance_alert_states_tenant_company_status_idx").on(
      table.tenantId,
      table.companyId,
      table.status
    ),
  ]
);

export const complianceAuditReferences = xforge.table(
  "compliance_audit_references",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    auditEventId: uuid("audit_event_id"),
    action: varchar("action", { length: 128 }).notNull(),
    entityType: varchar("entity_type", { length: 64 }).notNull(),
    entityId: text("entity_id").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("compliance_audit_refs_tenant_entity_idx").on(
      table.tenantId,
      table.entityType,
      table.entityId
    ),
    index("compliance_audit_refs_tenant_action_idx").on(
      table.tenantId,
      table.action
    ),
  ]
);

export const auditEvents = xforge.table(
  "audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "set null",
    }),
    grantId: uuid("grant_id").references(() => companyGrants.id, {
      onDelete: "set null",
    }),
    actorId: text("actor_id").notNull(),
    actorType: varchar("actor_type", { length: 32 }).notNull().default("user"),
    actorRole: varchar("actor_role", { length: 64 }),
    module: varchar("module", { length: 64 }).notNull().default(""),
    surface: varchar("surface", { length: 64 }),
    route: text("route"),
    subjectType: varchar("subject_type", { length: 128 }),
    subjectId: text("subject_id"),
    action: varchar("action", { length: 128 }).notNull(),
    summary: text("summary").notNull().default(""),
    outcome: varchar("outcome", { length: 16 }).notNull().default("success"),
    targetType: varchar("target_type", { length: 128 }).notNull(),
    targetId: text("target_id").notNull(),
    targetDisplayName: text("target_display_name"),
    reason: text("reason").notNull(),
    policyReference: text("policy_reference"),
    approvalId: text("approval_id"),
    channel: varchar("channel", { length: 32 }),
    requestId: varchar("request_id", { length: 128 }).notNull(),
    operationId: varchar("operation_id", { length: 128 }),
    before: jsonb("before").$type<Record<string, unknown>>().notNull(),
    after: jsonb("after").$type<Record<string, unknown>>().notNull(),
    diff: jsonb("diff")
      .$type<Record<string, unknown>[]>()
      .notNull()
      .default([]),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    occurredAt: timestamp("occurred_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_events_tenant_occurred_idx").on(
      table.tenantId,
      table.occurredAt
    ),
    index("audit_events_tenant_actor_occurred_idx").on(
      table.tenantId,
      table.actorId,
      table.occurredAt
    ),
    index("audit_events_tenant_action_occurred_idx").on(
      table.tenantId,
      table.action,
      table.occurredAt
    ),
    index("audit_events_tenant_module_occurred_idx").on(
      table.tenantId,
      table.module,
      table.occurredAt
    ),
    index("audit_events_tenant_subject_occurred_idx").on(
      table.tenantId,
      table.subjectType,
      table.subjectId,
      table.occurredAt
    ),
    index("audit_events_tenant_target_idx").on(
      table.tenantId,
      table.targetType,
      table.targetId
    ),
    index("audit_events_tenant_request_id_idx").on(
      table.tenantId,
      table.requestId
    ),
    index("audit_events_tenant_operation_id_idx").on(
      table.tenantId,
      table.operationId
    ),
    index("audit_events_company_occurred_idx").on(
      table.companyId,
      table.occurredAt
    ),
  ]
);

export const tenantsRelations = relations(tenants, ({ many }) => ({
  companies: many(companies),
  complianceAlertStates: many(complianceAlertStates),
  complianceAuditReferences: many(complianceAuditReferences),
  complianceCorrectiveActions: many(complianceCorrectiveActions),
  complianceEvidenceArtifacts: many(complianceEvidenceArtifacts),
  complianceExceptions: many(complianceExceptions),
  complianceFilings: many(complianceFilings),
  complianceObligations: many(complianceObligations),
  complianceWorkerProfiles: many(complianceWorkerProfiles),
  customers: many(customers),
  memberships: many(tenantMemberships),
  webhookEndpoints: many(webhookEndpoints),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [companies.tenantId],
    references: [tenants.id],
  }),
  complianceAlertStates: many(complianceAlertStates),
  complianceAuditReferences: many(complianceAuditReferences),
  complianceCorrectiveActions: many(complianceCorrectiveActions),
  complianceEvidenceArtifacts: many(complianceEvidenceArtifacts),
  complianceExceptions: many(complianceExceptions),
  complianceFilings: many(complianceFilings),
  complianceObligations: many(complianceObligations),
  complianceWorkerProfiles: many(complianceWorkerProfiles),
  grants: many(companyGrants),
  webhookEndpoints: many(webhookEndpoints),
}));

export const customersRelations = relations(customers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [customers.tenantId],
    references: [tenants.id],
  }),
}));

export const tenantMembershipsRelations = relations(
  tenantMemberships,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [tenantMemberships.tenantId],
      references: [tenants.id],
    }),
  })
);

export const companyGrantsRelations = relations(companyGrants, ({ one }) => ({
  tenant: one(tenants, {
    fields: [companyGrants.tenantId],
    references: [tenants.id],
  }),
  company: one(companies, {
    fields: [companyGrants.companyId],
    references: [companies.id],
  }),
}));

export const notificationInboxRelations = relations(
  notificationInbox,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [notificationInbox.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [notificationInbox.companyId],
      references: [companies.id],
    }),
  })
);

export const webhookEndpointsRelations = relations(
  webhookEndpoints,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [webhookEndpoints.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [webhookEndpoints.companyId],
      references: [companies.id],
    }),
  })
);

export const auditEventsRelations = relations(auditEvents, ({ one }) => ({
  tenant: one(tenants, {
    fields: [auditEvents.tenantId],
    references: [tenants.id],
  }),
  company: one(companies, {
    fields: [auditEvents.companyId],
    references: [companies.id],
  }),
  grant: one(companyGrants, {
    fields: [auditEvents.grantId],
    references: [companyGrants.id],
  }),
}));

export const complianceObligationsRelations = relations(
  complianceObligations,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [complianceObligations.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [complianceObligations.companyId],
      references: [companies.id],
    }),
  })
);

export const complianceWorkerProfilesRelations = relations(
  complianceWorkerProfiles,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [complianceWorkerProfiles.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [complianceWorkerProfiles.companyId],
      references: [companies.id],
    }),
  })
);

export const complianceEvidenceArtifactsRelations = relations(
  complianceEvidenceArtifacts,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [complianceEvidenceArtifacts.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [complianceEvidenceArtifacts.companyId],
      references: [companies.id],
    }),
  })
);

export const complianceExceptionsRelations = relations(
  complianceExceptions,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [complianceExceptions.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [complianceExceptions.companyId],
      references: [companies.id],
    }),
  })
);

export const complianceCorrectiveActionsRelations = relations(
  complianceCorrectiveActions,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [complianceCorrectiveActions.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [complianceCorrectiveActions.companyId],
      references: [companies.id],
    }),
  })
);

export const complianceFilingsRelations = relations(
  complianceFilings,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [complianceFilings.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [complianceFilings.companyId],
      references: [companies.id],
    }),
  })
);

export const complianceAlertStatesRelations = relations(
  complianceAlertStates,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [complianceAlertStates.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [complianceAlertStates.companyId],
      references: [companies.id],
    }),
  })
);

export const complianceAuditReferencesRelations = relations(
  complianceAuditReferences,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [complianceAuditReferences.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [complianceAuditReferences.companyId],
      references: [companies.id],
    }),
  })
);

export const databaseSchema: Omit<
  typeof import("./schema.ts"),
  "databaseSchema"
> = {
  auditEvents,
  auditEventsRelations,
  companies,
  companiesRelations,
  companyGrants,
  companyGrantsRelations,
  complianceAlertStates,
  complianceAlertStatesRelations,
  complianceAuditReferences,
  complianceAuditReferencesRelations,
  complianceCorrectiveActions,
  complianceCorrectiveActionsRelations,
  complianceEvidenceArtifacts,
  complianceEvidenceArtifactsRelations,
  complianceExceptions,
  complianceExceptionsRelations,
  complianceFilings,
  complianceFilingsRelations,
  complianceObligations,
  complianceObligationsRelations,
  complianceWorkerProfiles,
  complianceWorkerProfilesRelations,
  customers,
  customersRelations,
  notificationInbox,
  notificationInboxRelations,
  tenantMemberships,
  tenantMembershipsRelations,
  tenants,
  tenantsRelations,
  webhookEndpoints,
  webhookEndpointsRelations,
  xforge,
};

export type Tenant = InferSelectModel<typeof tenants>;
export type NewTenant = InferInsertModel<typeof tenants>;
export type Company = InferSelectModel<typeof companies>;
export type NewCompany = InferInsertModel<typeof companies>;
export type ComplianceObligation = InferSelectModel<
  typeof complianceObligations
>;
export type NewComplianceObligation = InferInsertModel<
  typeof complianceObligations
>;
export type ComplianceWorkerProfile = InferSelectModel<
  typeof complianceWorkerProfiles
>;
export type NewComplianceWorkerProfile = InferInsertModel<
  typeof complianceWorkerProfiles
>;
export type ComplianceEvidenceArtifact = InferSelectModel<
  typeof complianceEvidenceArtifacts
>;
export type NewComplianceEvidenceArtifact = InferInsertModel<
  typeof complianceEvidenceArtifacts
>;
export type ComplianceException = InferSelectModel<typeof complianceExceptions>;
export type NewComplianceException = InferInsertModel<
  typeof complianceExceptions
>;
export type ComplianceCorrectiveAction = InferSelectModel<
  typeof complianceCorrectiveActions
>;
export type NewComplianceCorrectiveAction = InferInsertModel<
  typeof complianceCorrectiveActions
>;
export type ComplianceFiling = InferSelectModel<typeof complianceFilings>;
export type NewComplianceFiling = InferInsertModel<typeof complianceFilings>;
export type ComplianceAlertState = InferSelectModel<
  typeof complianceAlertStates
>;
export type NewComplianceAlertState = InferInsertModel<
  typeof complianceAlertStates
>;
export type ComplianceAuditReference = InferSelectModel<
  typeof complianceAuditReferences
>;
export type NewComplianceAuditReference = InferInsertModel<
  typeof complianceAuditReferences
>;
export type Customer = InferSelectModel<typeof customers>;
export type NewCustomer = InferInsertModel<typeof customers>;
export type TenantMembership = InferSelectModel<typeof tenantMemberships>;
export type NewTenantMembership = InferInsertModel<typeof tenantMemberships>;
export type CompanyGrant = InferSelectModel<typeof companyGrants>;
export type NewCompanyGrant = InferInsertModel<typeof companyGrants>;
export type NotificationInboxEntry = InferSelectModel<typeof notificationInbox>;
export type NewNotificationInboxEntry = InferInsertModel<
  typeof notificationInbox
>;
export type WebhookEndpoint = InferSelectModel<typeof webhookEndpoints>;
export type NewWebhookEndpoint = InferInsertModel<typeof webhookEndpoints>;
export type AuditEvent = InferSelectModel<typeof auditEvents>;
export type NewAuditEvent = InferInsertModel<typeof auditEvents>;
