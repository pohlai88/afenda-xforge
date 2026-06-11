import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgSchema,
  primaryKey,
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

export const tenantSettings = xforge.table("tenant_settings", {
  tenantId: uuid("tenant_id")
    .primaryKey()
    .references(() => tenants.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  defaultLocale: varchar("default_locale", { length: 16 })
    .notNull()
    .default("en"),
  defaultTimezone: varchar("default_timezone", { length: 64 })
    .notNull()
    .default("UTC"),
  customizationMode: varchar("customization_mode", { length: 32 }),
  themePreset: varchar("theme_preset", { length: 32 }).notNull().default("xforge"),
  branding: jsonb("branding")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
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
});

export const userAppearancePreferences = xforge.table(
  "user_appearance_preferences",
  {
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    themePreset: varchar("theme_preset", { length: 32 }),
    branding: jsonb("branding")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
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
    primaryKey({ columns: [table.tenantId, table.userId] }),
    index("user_appearance_preferences_user_id_idx").on(table.userId),
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

export const employeeRecordAssignmentHistory = xforge.table(
  "employee_record_assignment_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    employeeId: text("employee_id").notNull(),
    departmentId: text("department_id"),
    positionId: text("position_id"),
    workLocationCode: varchar("work_location_code", { length: 96 }),
    managerEmployeeId: text("manager_employee_id"),
    effectiveFrom: timestamp("effective_from", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    effectiveTo: timestamp("effective_to", {
      mode: "date",
      withTimezone: true,
    }),
    source: varchar("source", { length: 64 }).notNull(),
    reason: text("reason"),
    actorId: text("actor_id"),
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
    index("employee_record_assignment_history_tenant_company_employee_idx").on(
      table.tenantId,
      table.companyId,
      table.employeeId
    ),
    index(
      "employee_record_assignment_history_tenant_company_department_idx"
    ).on(table.tenantId, table.companyId, table.departmentId),
    index("employee_record_assignment_history_tenant_company_manager_idx").on(
      table.tenantId,
      table.companyId,
      table.managerEmployeeId
    ),
    index("employee_record_assignment_history_tenant_company_location_idx").on(
      table.tenantId,
      table.companyId,
      table.workLocationCode
    ),
    index("employee_record_assignment_history_tenant_company_effective_idx").on(
      table.tenantId,
      table.companyId,
      table.effectiveFrom
    ),
  ]
);

export const employeeRecordStatusHistory = xforge.table(
  "employee_record_status_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    employeeId: text("employee_id").notNull(),
    status: varchar("status", { length: 16 }).notNull(),
    previousStatus: varchar("previous_status", { length: 16 }),
    effectiveAt: timestamp("effective_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    source: varchar("source", { length: 64 }).notNull(),
    reason: text("reason"),
    actorId: text("actor_id"),
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
    index("employee_record_status_history_tenant_company_employee_idx").on(
      table.tenantId,
      table.companyId,
      table.employeeId
    ),
    index("employee_record_status_history_tenant_company_status_idx").on(
      table.tenantId,
      table.companyId,
      table.status
    ),
    index("employee_record_status_history_tenant_company_effective_idx").on(
      table.tenantId,
      table.companyId,
      table.effectiveAt
    ),
    index("employee_record_status_history_tenant_company_source_idx").on(
      table.tenantId,
      table.companyId,
      table.source
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

export const offboardingCases = xforge.table(
  "offboarding_cases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    employeeId: text("employee_id").notNull(),
    lifecycleExitReference: text("lifecycle_exit_reference"),
    exitType: varchar("exit_type", { length: 64 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    reason: text("reason").notNull(),
    reasonDetails: text("reason_details"),
    effectiveSeparationDate: timestamp("effective_separation_date", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    noticeStartDate: timestamp("notice_start_date", {
      mode: "date",
      withTimezone: true,
    }),
    noticeEndDate: timestamp("notice_end_date", {
      mode: "date",
      withTimezone: true,
    }),
    requiredNoticeDays: integer("required_notice_days"),
    waivedNotice: boolean("waived_notice").notNull().default(false),
    waivedNoticeReason: text("waived_notice_reason"),
    lastWorkingDate: timestamp("last_working_date", {
      mode: "date",
      withTimezone: true,
    }),
    initiatedBy: text("initiated_by"),
    initiationSource: varchar("initiation_source", { length: 32 }).notNull(),
    legalEntityCode: varchar("legal_entity_code", { length: 96 }),
    departmentId: text("department_id"),
    managerEmployeeId: text("manager_employee_id"),
    workLocationCode: varchar("work_location_code", { length: 96 }),
    policyReference: text("policy_reference"),
    riskLevel: varchar("risk_level", { length: 32 }).notNull(),
    legalReviewRequired: boolean("legal_review_required")
      .notNull()
      .default(false),
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
    index("offboarding_cases_tenant_company_employee_idx").on(
      table.tenantId,
      table.companyId,
      table.employeeId
    ),
    index("offboarding_cases_tenant_company_status_idx").on(
      table.tenantId,
      table.companyId,
      table.status
    ),
    index("offboarding_cases_tenant_company_exit_type_idx").on(
      table.tenantId,
      table.companyId,
      table.exitType
    ),
    index("offboarding_cases_tenant_company_effective_idx").on(
      table.tenantId,
      table.companyId,
      table.effectiveSeparationDate
    ),
  ]
);

export const offboardingApprovalSteps = xforge.table(
  "offboarding_approval_steps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    caseId: uuid("case_id")
      .notNull()
      .references(() => offboardingCases.id, { onDelete: "cascade" }),
    employeeId: text("employee_id").notNull(),
    exitType: varchar("exit_type", { length: 64 }).notNull(),
    legalEntityCode: varchar("legal_entity_code", { length: 96 }),
    departmentId: text("department_id"),
    riskLevel: varchar("risk_level", { length: 32 }).notNull(),
    legalReviewRequired: boolean("legal_review_required")
      .notNull()
      .default(false),
    stepCode: varchar("step_code", { length: 96 }).notNull(),
    stepLabel: text("step_label").notNull(),
    sequence: integer("sequence").notNull(),
    required: boolean("required").notNull().default(true),
    status: varchar("status", { length: 32 }).notNull(),
    routeToType: varchar("route_to_type", { length: 32 }).notNull(),
    routeToId: text("route_to_id").notNull(),
    routeToLabel: text("route_to_label"),
    escalationTargetType: varchar("escalation_target_type", { length: 32 }),
    escalationTargetId: text("escalation_target_id"),
    escalationTargetLabel: text("escalation_target_label"),
    submittedAt: timestamp("submitted_at", {
      mode: "date",
      withTimezone: true,
    }),
    submittedBy: text("submitted_by"),
    approvedAt: timestamp("approved_at", {
      mode: "date",
      withTimezone: true,
    }),
    approvedBy: text("approved_by"),
    rejectedAt: timestamp("rejected_at", {
      mode: "date",
      withTimezone: true,
    }),
    rejectedBy: text("rejected_by"),
    rejectionReason: text("rejection_reason"),
    decisionNotes: text("decision_notes"),
    reopenedAt: timestamp("reopened_at", {
      mode: "date",
      withTimezone: true,
    }),
    reopenedBy: text("reopened_by"),
    reopenedReason: text("reopened_reason"),
    escalatedAt: timestamp("escalated_at", {
      mode: "date",
      withTimezone: true,
    }),
    escalatedBy: text("escalated_by"),
    escalationReason: text("escalation_reason"),
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
    index("offboarding_approval_steps_tenant_case_idx").on(
      table.tenantId,
      table.caseId
    ),
    index("offboarding_approval_steps_tenant_company_status_idx").on(
      table.tenantId,
      table.companyId,
      table.status
    ),
    index("offboarding_approval_steps_tenant_company_employee_idx").on(
      table.tenantId,
      table.companyId,
      table.employeeId
    ),
    index("offboarding_approval_steps_tenant_company_route_idx").on(
      table.tenantId,
      table.companyId,
      table.routeToId
    ),
    uniqueIndex("offboarding_approval_steps_tenant_case_step_sequence_uidx").on(
      table.tenantId,
      table.caseId,
      table.stepCode,
      table.sequence
    ),
  ]
);

export const offboardingAuditReferences = xforge.table(
  "offboarding_audit_references",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id").references(() => companies.id, {
      onDelete: "cascade",
    }),
    actorId: text("actor_id"),
    action: varchar("action", { length: 128 }).notNull(),
    entityType: varchar("entity_type", { length: 64 }).notNull(),
    entityId: text("entity_id").notNull(),
    summary: text("summary"),
    reason: text("reason"),
    sensitive: boolean("sensitive").notNull().default(false),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("offboarding_audit_refs_tenant_entity_idx").on(
      table.tenantId,
      table.entityType,
      table.entityId
    ),
    index("offboarding_audit_refs_tenant_action_idx").on(
      table.tenantId,
      table.action
    ),
    index("offboarding_audit_refs_tenant_company_created_idx").on(
      table.tenantId,
      table.companyId,
      table.createdAt
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

export const hrOrgUnits = xforge.table(
  "hr_org_units",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 96 }).notNull(),
    name: text("name").notNull(),
    unitType: varchar("unit_type", { length: 64 }).notNull(),
    parentUnitId: uuid("parent_unit_id"),
    managerEmployeeId: text("manager_employee_id"),
    costCenterCode: varchar("cost_center_code", { length: 96 }),
    locationCode: varchar("location_code", { length: 96 }),
    legalEntityCode: varchar("legal_entity_code", { length: 96 }),
    status: varchar("status", { length: 16 }).notNull().default("active"),
    effectiveFrom: timestamp("effective_from", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    effectiveTo: timestamp("effective_to", {
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
    foreignKey({
      columns: [table.parentUnitId],
      foreignColumns: [table.id],
      name: "hr_org_units_parent_unit_id_hr_org_units_id_fk",
    }).onDelete("set null"),
    index("hr_org_units_tenant_company_idx").on(
      table.tenantId,
      table.companyId
    ),
    index("hr_org_units_tenant_company_status_idx").on(
      table.tenantId,
      table.companyId,
      table.status
    ),
    index("hr_org_units_tenant_company_type_idx").on(
      table.tenantId,
      table.companyId,
      table.unitType
    ),
    index("hr_org_units_tenant_company_parent_idx").on(
      table.tenantId,
      table.companyId,
      table.parentUnitId
    ),
    index("hr_org_units_tenant_company_location_idx").on(
      table.tenantId,
      table.companyId,
      table.locationCode
    ),
    index("hr_org_units_tenant_company_legal_entity_idx").on(
      table.tenantId,
      table.companyId,
      table.legalEntityCode
    ),
    uniqueIndex("hr_org_units_tenant_company_code_unique").on(
      table.tenantId,
      table.companyId,
      table.code
    ),
  ]
);

export const hrOrgPositions = xforge.table(
  "hr_org_positions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 96 }).notNull(),
    title: text("title").notNull(),
    organizationUnitId: uuid("organization_unit_id")
      .notNull()
      .references(() => hrOrgUnits.id, { onDelete: "restrict" }),
    managerEmployeeId: text("manager_employee_id"),
    costCenterCode: varchar("cost_center_code", { length: 96 }),
    locationCode: varchar("location_code", { length: 96 }),
    status: varchar("status", { length: 16 }).notNull().default("active"),
    effectiveFrom: timestamp("effective_from", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    effectiveTo: timestamp("effective_to", {
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
    index("hr_org_positions_tenant_company_idx").on(
      table.tenantId,
      table.companyId
    ),
    index("hr_org_positions_tenant_company_status_idx").on(
      table.tenantId,
      table.companyId,
      table.status
    ),
    index("hr_org_positions_tenant_company_unit_idx").on(
      table.tenantId,
      table.companyId,
      table.organizationUnitId
    ),
    index("hr_org_positions_tenant_company_location_idx").on(
      table.tenantId,
      table.companyId,
      table.locationCode
    ),
    uniqueIndex("hr_org_positions_tenant_company_code_unique").on(
      table.tenantId,
      table.companyId,
      table.code
    ),
  ]
);

export const hrOrgReportingRelationships = xforge.table(
  "hr_org_reporting_relationships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    employeeId: text("employee_id").notNull(),
    managerEmployeeId: text("manager_employee_id").notNull(),
    relationshipType: varchar("relationship_type", { length: 64 }).notNull(),
    effectiveFrom: timestamp("effective_from", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    effectiveTo: timestamp("effective_to", {
      mode: "date",
      withTimezone: true,
    }),
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
    index("hr_org_reporting_relationships_tenant_company_idx").on(
      table.tenantId,
      table.companyId
    ),
    index("hr_org_reporting_relationships_tenant_company_employee_idx").on(
      table.tenantId,
      table.companyId,
      table.employeeId
    ),
    index("hr_org_reporting_relationships_tenant_company_manager_idx").on(
      table.tenantId,
      table.companyId,
      table.managerEmployeeId
    ),
    uniqueIndex(
      "hr_org_reporting_relationships_tenant_company_identity_unique"
    ).on(
      table.tenantId,
      table.companyId,
      table.employeeId,
      table.managerEmployeeId,
      table.relationshipType,
      table.effectiveFrom
    ),
  ]
);

export const hrOrgStructureAuditReferences = xforge.table(
  "hr_org_structure_audit_references",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "cascade" }),
    auditEventId: uuid("audit_event_id")
      .notNull()
      .references(() => auditEvents.id, { onDelete: "cascade" }),
    entityType: varchar("entity_type", { length: 64 }).notNull(),
    entityId: text("entity_id").notNull(),
    action: varchar("action", { length: 128 }).notNull(),
    summary: text("summary").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("hr_org_structure_audit_refs_tenant_company_idx").on(
      table.tenantId,
      table.companyId
    ),
    index("hr_org_structure_audit_refs_tenant_entity_idx").on(
      table.tenantId,
      table.entityType,
      table.entityId
    ),
    uniqueIndex("hr_org_structure_audit_refs_tenant_audit_event_unique").on(
      table.tenantId,
      table.auditEventId
    ),
  ]
);

export const tenantsRelations = relations(tenants, ({ many, one }) => ({
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
  hrOrgPositions: many(hrOrgPositions),
  hrOrgReportingRelationships: many(hrOrgReportingRelationships),
  hrOrgStructureAuditReferences: many(hrOrgStructureAuditReferences),
  hrOrgUnits: many(hrOrgUnits),
  offboardingApprovalSteps: many(offboardingApprovalSteps),
  offboardingAuditReferences: many(offboardingAuditReferences),
  offboardingCases: many(offboardingCases),
  memberships: many(tenantMemberships),
  settings: one(tenantSettings),
  webhookEndpoints: many(webhookEndpoints),
}));

export const tenantSettingsRelations = relations(tenantSettings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantSettings.tenantId],
    references: [tenants.id],
  }),
}));

export const userAppearancePreferencesRelations = relations(
  userAppearancePreferences,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [userAppearancePreferences.tenantId],
      references: [tenants.id],
    }),
  })
);

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
  hrOrgPositions: many(hrOrgPositions),
  hrOrgReportingRelationships: many(hrOrgReportingRelationships),
  hrOrgStructureAuditReferences: many(hrOrgStructureAuditReferences),
  hrOrgUnits: many(hrOrgUnits),
  offboardingApprovalSteps: many(offboardingApprovalSteps),
  offboardingAuditReferences: many(offboardingAuditReferences),
  offboardingCases: many(offboardingCases),
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

export const employeeRecordAssignmentHistoryRelations = relations(
  employeeRecordAssignmentHistory,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [employeeRecordAssignmentHistory.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [employeeRecordAssignmentHistory.companyId],
      references: [companies.id],
    }),
  })
);

export const employeeRecordStatusHistoryRelations = relations(
  employeeRecordStatusHistory,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [employeeRecordStatusHistory.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [employeeRecordStatusHistory.companyId],
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

export const offboardingCasesRelations = relations(
  offboardingCases,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [offboardingCases.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [offboardingCases.companyId],
      references: [companies.id],
    }),
  })
);

export const offboardingApprovalStepsRelations = relations(
  offboardingApprovalSteps,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [offboardingApprovalSteps.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [offboardingApprovalSteps.companyId],
      references: [companies.id],
    }),
  })
);

export const offboardingAuditReferencesRelations = relations(
  offboardingAuditReferences,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [offboardingAuditReferences.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [offboardingAuditReferences.companyId],
      references: [companies.id],
    }),
  })
);

export const hrOrgUnitsRelations = relations(hrOrgUnits, ({ one }) => ({
  tenant: one(tenants, {
    fields: [hrOrgUnits.tenantId],
    references: [tenants.id],
  }),
  company: one(companies, {
    fields: [hrOrgUnits.companyId],
    references: [companies.id],
  }),
}));

export const hrOrgPositionsRelations = relations(hrOrgPositions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [hrOrgPositions.tenantId],
    references: [tenants.id],
  }),
  company: one(companies, {
    fields: [hrOrgPositions.companyId],
    references: [companies.id],
  }),
  organizationUnit: one(hrOrgUnits, {
    fields: [hrOrgPositions.organizationUnitId],
    references: [hrOrgUnits.id],
  }),
}));

export const hrOrgReportingRelationshipsRelations = relations(
  hrOrgReportingRelationships,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [hrOrgReportingRelationships.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [hrOrgReportingRelationships.companyId],
      references: [companies.id],
    }),
  })
);

export const hrOrgStructureAuditReferencesRelations = relations(
  hrOrgStructureAuditReferences,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [hrOrgStructureAuditReferences.tenantId],
      references: [tenants.id],
    }),
    company: one(companies, {
      fields: [hrOrgStructureAuditReferences.companyId],
      references: [companies.id],
    }),
    auditEvent: one(auditEvents, {
      fields: [hrOrgStructureAuditReferences.auditEventId],
      references: [auditEvents.id],
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
  employeeRecordAssignmentHistory,
  employeeRecordAssignmentHistoryRelations,
  employeeRecordStatusHistory,
  employeeRecordStatusHistoryRelations,
  customers,
  customersRelations,
  hrOrgPositions,
  hrOrgPositionsRelations,
  hrOrgReportingRelationships,
  hrOrgReportingRelationshipsRelations,
  hrOrgStructureAuditReferences,
  hrOrgStructureAuditReferencesRelations,
  hrOrgUnits,
  hrOrgUnitsRelations,
  offboardingApprovalSteps,
  offboardingApprovalStepsRelations,
  offboardingAuditReferences,
  offboardingAuditReferencesRelations,
  offboardingCases,
  offboardingCasesRelations,
  notificationInbox,
  notificationInboxRelations,
  tenantMemberships,
  tenantMembershipsRelations,
  tenantSettings,
  tenantSettingsRelations,
  userAppearancePreferences,
  userAppearancePreferencesRelations,
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
export type EmployeeRecordAssignmentHistory = InferSelectModel<
  typeof employeeRecordAssignmentHistory
>;
export type NewEmployeeRecordAssignmentHistory = InferInsertModel<
  typeof employeeRecordAssignmentHistory
>;
export type EmployeeRecordStatusHistory = InferSelectModel<
  typeof employeeRecordStatusHistory
>;
export type NewEmployeeRecordStatusHistory = InferInsertModel<
  typeof employeeRecordStatusHistory
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
export type OffboardingCase = InferSelectModel<typeof offboardingCases>;
export type NewOffboardingCase = InferInsertModel<typeof offboardingCases>;
export type OffboardingApprovalStep = InferSelectModel<
  typeof offboardingApprovalSteps
>;
export type NewOffboardingApprovalStep = InferInsertModel<
  typeof offboardingApprovalSteps
>;
export type OffboardingAuditReference = InferSelectModel<
  typeof offboardingAuditReferences
>;
export type NewOffboardingAuditReference = InferInsertModel<
  typeof offboardingAuditReferences
>;
export type Customer = InferSelectModel<typeof customers>;
export type NewCustomer = InferInsertModel<typeof customers>;
export type TenantMembership = InferSelectModel<typeof tenantMemberships>;
export type NewTenantMembership = InferInsertModel<typeof tenantMemberships>;
export type TenantSettings = InferSelectModel<typeof tenantSettings>;
export type NewTenantSettings = InferInsertModel<typeof tenantSettings>;
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
export type HrOrgUnit = InferSelectModel<typeof hrOrgUnits>;
export type NewHrOrgUnit = InferInsertModel<typeof hrOrgUnits>;
export type HrOrgPosition = InferSelectModel<typeof hrOrgPositions>;
export type NewHrOrgPosition = InferInsertModel<typeof hrOrgPositions>;
export type HrOrgReportingRelationship = InferSelectModel<
  typeof hrOrgReportingRelationships
>;
export type NewHrOrgReportingRelationship = InferInsertModel<
  typeof hrOrgReportingRelationships
>;
export type HrOrgStructureAuditReference = InferSelectModel<
  typeof hrOrgStructureAuditReferences
>;
export type NewHrOrgStructureAuditReference = InferInsertModel<
  typeof hrOrgStructureAuditReferences
>;
